import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getAuthHeadersSafe, isAuthenticated } from '@/utils/token';
import { mergeFeedPageIntoItems, parsePagedFeedPage } from '@/utils/feedPagination';
import { useSelectedInventura } from '@/hooks/useSelectedInventura';
import { useGetLocation } from '@/hooks/useLocation';
import { useBuildings, useStoreys, useRooms } from '@/hooks/useBuildings';
import Button from '@/components/atoms/Button';
import TextInput from '@/components/atoms/TextInput';
import CenteredModal from '@/components/molecules/CenteredModal';
import LocationPicker from '@/components/organisms/LocationPicker';

const PAGE_SIZE = 20;

// Helper function to get location name from location object
function useLocationName(location) {
  const { buildings } = useBuildings();
  const { storeys } = useStoreys(location?.building);
  const { rooms } = useRooms(location?.building, location?.storey);

  if (!location) return null;

  const building = Array.isArray(buildings) ? buildings.find(b => b.id === location.building) : undefined;
  const storey = Array.isArray(storeys) ? storeys.find(s => s.id === location.storey) : undefined;
  const room = Array.isArray(rooms) ? rooms.find(r => r.id === location.room) : undefined;

  const parts = [];
  if (building) parts.push(building.text);
  if (storey) parts.push(storey.text);
  if (room) parts.push(room.text);

  return parts.length > 0 ? parts.join(' / ') : null;
}

// Custom base item card component
function BaseItemCard({ item, isSelected, onClick }) {
  const locationName = useLocationName(item.location);

  return (
    <div
      style={{
        background: isSelected ? "#f0f0f0" : "#fff",
        borderRadius: "16px",
        padding: "1rem",
        cursor: "pointer",
        transition: "all 0.2s",
        border: isSelected ? "2px solid #282828" : "1px solid #e0e0e0",
        boxShadow: isSelected ? "0 2px 8px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.05)"
      }}
      onClick={onClick}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ fontWeight: 600, fontSize: "1rem", color: "#000" }}>
          {item.name}
        </div>
        {item.description && (
          <div style={{ fontSize: "0.875rem", color: "#666" }}>
            {item.description}
          </div>
        )}
        {locationName && (
          <div style={{ fontSize: "0.75rem", color: "#888", fontStyle: "italic" }}>
            Místnost: {locationName}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BaseItemPicker({ isOpen, onClose, onSelectBaseItem }) {
    const { selectedInventura } = useSelectedInventura();
    const getLocation = useGetLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [filterLocation, setFilterLocation] = useState(null);
    const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState('asc');
    const [baseItems, setBaseItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [hasMoreNext, setHasMoreNext] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const lastQueryKeyRef = useRef('');

    const excludeEventId = useMemo(() => {
        const raw = selectedInventura?.id;
        const n = Number(raw);
        return Number.isFinite(n) && n > 0 ? n : null;
    }, [selectedInventura?.id]);

    // Load location from storage on mount and when getLocation changes
    useEffect(() => {
        const stored = getLocation();
        if (stored) {
            setFilterLocation(stored);
        }
    }, [getLocation]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
        return () => clearTimeout(t);
    }, [searchTerm]);

    const queryKey = useMemo(
        () =>
            JSON.stringify({
                e: excludeEventId,
                sortBy,
                sortOrder,
                search: debouncedSearch,
                b: filterLocation?.building ?? null,
                s: filterLocation?.storey ?? null,
                r: filterLocation?.room ?? null,
            }),
        [
            excludeEventId,
            sortBy,
            sortOrder,
            debouncedSearch,
            filterLocation?.building,
            filterLocation?.storey,
            filterLocation?.room,
        ]
    );

    useEffect(() => {
        if (!isOpen || excludeEventId == null || !isAuthenticated()) {
            setBaseItems([]);
            setLoading(false);
            setLoadingMore(false);
            setError(null);
            setPage(0);
            setTotal(0);
            setHasMoreNext(false);
            lastQueryKeyRef.current = '';
            return undefined;
        }

        const queryChanged = lastQueryKeyRef.current !== queryKey;
        if (queryChanged) {
            lastQueryKeyRef.current = queryKey;
            if (page !== 0) {
                setPage(0);
                return undefined;
            }
        }

        const ac = new AbortController();

        (async () => {
            if (page === 0) setLoading(true);
            else setLoadingMore(true);
            setError(null);
            try {
                const body = {
                    page,
                    limit: PAGE_SIZE,
                    sortBy,
                    sortOrder,
                    search: debouncedSearch,
                    excludeEventId,
                };
                if (filterLocation?.building) body.buildingId = filterLocation.building;
                if (filterLocation?.storey) body.storeyId = filterLocation.storey;
                if (filterLocation?.room) body.roomId = filterLocation.room;

                const res = await fetch('/api/base-items/feed', {
                    method: 'POST',
                    headers: getAuthHeadersSafe(),
                    body: JSON.stringify(body),
                    signal: ac.signal,
                });
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`HTTP ${res.status}: ${errorText}`);
                }
                const data = await res.json();
                if (!ac.signal.aborted) {
                    const { pageItems, resolvedTotal, hasMoreNext: more } = parsePagedFeedPage(data);
                    setBaseItems((prev) =>
                        page === 0 ? pageItems : mergeFeedPageIntoItems(prev, pageItems)
                    );
                    setTotal(resolvedTotal);
                    setHasMoreNext(more);
                }
            } catch (err) {
                if (err.name === 'AbortError') return;
                if (!ac.signal.aborted) setError(err);
            } finally {
                if (!ac.signal.aborted) {
                    if (page === 0) setLoading(false);
                    else setLoadingMore(false);
                }
            }
        })();

        return () => {
            ac.abort();
        };
    }, [
        isOpen,
        excludeEventId,
        page,
        queryKey,
        sortBy,
        sortOrder,
        debouncedSearch,
        filterLocation?.building,
        filterLocation?.storey,
        filterLocation?.room,
    ]);

    const handleSelectItem = (item) => {
        setSelectedItem(item);
    };

    const handleConfirm = () => {
        if (selectedItem) {
            onSelectBaseItem(selectedItem);
            onClose();
            setSelectedItem(null);
            setSearchTerm('');
        }
    };

    const handleClose = () => {
        onClose();
        setSelectedItem(null);
        setSearchTerm('');
    };


    if (!selectedInventura) {
        return (
            <CenteredModal isOpen={isOpen} onClose={handleClose} title="Vybrat základní položku">
                <div style={{ color: '#FF6262', fontWeight: 600, padding: '1rem' }}>
                    Nejprve vyberte inventuru na hlavní stránce.
                </div>
            </CenteredModal>
        );
    }


    return (
        <CenteredModal isOpen={isOpen} onClose={handleClose} title="Vybrat základní položku" disableClickAway={isLocationPickerOpen}>
            <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                height: "80dvh", 
                maxHeight: "600px", 
                minHeight: "400px",
                position: "relative"
            }}>
                {/* Fixed Header - Search and Filters */}
                <div style={{ flexShrink: 0 }}>
                    {/* Search */}
                    <div style={{ marginBottom: "0.75rem" }}>
                        <TextInput
                            placeholder="Hledat položky..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                width: "100%",
                                border: "1px solid #e0e0e0",
                                borderRadius: "8px",
                                padding: "0.75rem",
                                fontSize: "0.875rem"
                            }}
                        />
                    </div>

                    {/* Filters - Compact */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.75rem" }}>
                        {/* Location Filter */}
                        <LocationPicker
                            value={filterLocation}
                            onChange={setFilterLocation}
                            editMode={true}
                            label="Lokace:"
                            onModalOpen={() => setIsLocationPickerOpen(true)}
                            onModalClose={() => setIsLocationPickerOpen(false)}
                        />

                        {/* Sort Options - Compact mobile design */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ fontSize: "12px", color: "#666", fontWeight: 500, minWidth: "60px" }}>
                                Seřadit:
                            </div>
                            <div style={{ flex: 1, display: "flex", gap: "0.25rem" }}>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: "0.5rem",
                                        border: "1px solid #e0e0e0",
                                        borderRadius: "6px",
                                        fontSize: "0.875rem",
                                        backgroundColor: "white"
                                    }}
                                >
                                    <option value="id">ID</option>
                                    <option value="name">Název</option>
                                    <option value="description">Popis</option>
                                </select>
                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    style={{
                                        padding: "0.5rem",
                                        border: "1px solid #e0e0e0",
                                        borderRadius: "6px",
                                        backgroundColor: "white",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        minWidth: "40px",
                                        height: "40px"
                                    }}
                                >
                                    <span className="material-icons-round" style={{ fontSize: "14px" }}>
                                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Scrollable Content Area */}
                <div style={{ 
                    flex: 1, 
                    display: "flex", 
                    flexDirection: "column", 
                    minHeight: 0,
                    overflow: "hidden"
                }}>
                    {total > 0 && (
                        <div style={{ fontSize: "11px", color: "#888", marginBottom: "0.35rem" }}>
                            Celkem: {total}
                            {baseItems.length > 0 && baseItems.length < total ? ` · zobrazeno ${baseItems.length}` : null}
                        </div>
                    )}

                    {/* Loading */}
                    {loading && baseItems.length === 0 && (
                        <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                            Načítání...
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div style={{ color: "#FF6262", padding: "1rem" }}>
                            Chyba: {error.message}
                        </div>
                    )}

                    {/* Items List */}
                    {!error && (baseItems.length > 0 || !loading) && (
                        <div style={{ 
                            display: "flex", 
                            flexDirection: "column", 
                            gap: "0.5rem", 
                            overflowY: "auto",
                            flex: 1,
                            paddingRight: "4px" // Space for scrollbar
                        }}>
                            {baseItems.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                                    {debouncedSearch
                                        ? `Žádné položky nenalezeny pro „${debouncedSearch}“`
                                        : "Žádné položky neodpovídají filtru nebo už jsou v této inventuře."}
                                </div>
                            ) : (
                                baseItems.map(item => (
                                    <BaseItemCard
                                        key={item.id}
                                        item={item}
                                        isSelected={selectedItem?.id === item.id}
                                        onClick={() => handleSelectItem(item)}
                                    />
                                ))
                            )}
                            {hasMoreNext && baseItems.length > 0 && (
                                <div style={{ padding: "0.5rem 0", textAlign: "center" }}>
                                    <Button
                                        variant="secondary"
                                        disabled={loadingMore}
                                        onClick={() => setPage((p) => p + 1)}
                                    >
                                        {loadingMore ? "Načítání…" : "Načíst další"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Fixed Footer - Actions */}
                <div style={{ 
                    display: "flex", 
                    gap: "0.5rem", 
                    justifyContent: "flex-end", 
                    paddingTop: "0.75rem", 
                    borderTop: "1px solid #e0e0e0", 
                    marginTop: "0.75rem",
                    flexShrink: 0,
                    backgroundColor: "white",
                    position: "sticky",
                    bottom: 0
                }}>
                    <Button variant="secondary" onClick={handleClose}>
                        Storno
                    </Button>
                    <Button 
                        onClick={handleConfirm}
                        disabled={!selectedItem}
                        icon="check"
                        iconPosition="right"
                    >
                        Vybrat položku
                    </Button>
                </div>
            </div>
        </CenteredModal>
    );
}

import React, { useState, useEffect } from 'react';
import { useBaseItems } from '@/hooks/useBaseItems';
import { useSelectedInventura } from '@/hooks/useSelectedInventura';
import { useGetLocation } from '@/hooks/useLocation';
import { useBuildings, useStoreys, useRooms } from '@/hooks/useBuildings';
import Button from '@/components/atoms/Button';
import ButtonGroup from '@/components/atoms/ButtonGroup';
import TextInput from '@/components/atoms/TextInput';
import CenteredModal from '@/components/molecules/CenteredModal';
import LocationPicker from '@/components/organisms/LocationPicker';

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
    const [location, setLocation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [filterLocation, setFilterLocation] = useState(null);
    const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState('asc');

    // Load location from storage on mount and when getLocation changes
    useEffect(() => {
        const stored = getLocation();
        if (stored) {
            setLocation(stored);
            setFilterLocation(stored);
        }
    }, [getLocation]);

    const [baseItems, total, loading, error] = useBaseItems({
        offset: 0,
        limit: 20,
        sortBy: sortBy,
        sortOrder: sortOrder,
        search: searchTerm,
        buildingId: filterLocation?.building || null,
        storeyId: filterLocation?.storey || null,
        roomId: filterLocation?.room || null,
        eventId: selectedInventura?.id,
        skip: !isOpen || !selectedInventura?.id
    });

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
                    {/* Loading */}
                    {loading && (
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
                    {!loading && !error && (
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
                                    {searchTerm ? `Žádné položky nenalezeny pro "${searchTerm}"` : "Žádné položky v této místnosti"}
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

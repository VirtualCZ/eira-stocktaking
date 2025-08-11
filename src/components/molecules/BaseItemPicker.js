import React, { useState, useEffect } from 'react';
import { useBaseItems } from '@/hooks/useBaseItems';
import { useSelectedInventura } from '@/hooks/useSelectedInventura';
import { useGetLocation } from '@/hooks/useLocation';
import { useBuildings, useStoreys, useRooms } from '@/hooks/useBuildings';
import Button from '@/components/atoms/Button';
import TextInput from '@/components/atoms/TextInput';
import CenteredModal from '@/components/molecules/CenteredModal';
import LocationPicker from '@/components/organisms/LocationPicker';

// Helper function to get location name from location object
function useLocationName(location) {
  const [buildings] = useBuildings();
  const [storeys] = useStoreys(location?.building);
  const [rooms] = useRooms(location?.building, location?.storey);

  if (!location) return null;

  const building = buildings.find(b => b.id === location.building);
  const storey = storeys.find(s => s.id === location.storey);
  const room = rooms.find(r => r.id === location.room);

  if (!building || !storey || !room) return null;

  return `${building.text} / ${storey.text} / ${room.text}`;
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
        sortBy: 'id',
        sortOrder: 'asc',
        search: searchTerm,
        roomId: filterLocation?.room || null, // Only send if location filter is set
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

    const clearLocationFilter = () => {
        setFilterLocation(null);
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

    if (!location?.room) {
        return (
            <CenteredModal isOpen={isOpen} onClose={handleClose} title="Vybrat základní položku">
                <div style={{ color: '#FF6262', fontWeight: 600, padding: '1rem' }}>
                    Nejprve vyberte místnost (lokaci).
                </div>
            </CenteredModal>
        );
    }

    return (
        <CenteredModal isOpen={isOpen} onClose={handleClose} title="Vybrat základní položku" disableClickAway={isLocationPickerOpen}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minHeight: "400px" }}>
                {/* Search */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <TextInput
                        placeholder="Hledat položky..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            flex: 1,
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                            padding: "0.75rem",
                            fontSize: "0.875rem"
                        }}
                    />
                </div>

                {/* Location Filter */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ fontSize: "14px", color: "#666", fontWeight: 500 }}>
                        Filtrovat podle lokace:
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <LocationPicker
                            value={filterLocation}
                            onChange={setFilterLocation}
                            editMode={true}
                            label=""
                            onModalOpen={() => setIsLocationPickerOpen(true)}
                            onModalClose={() => setIsLocationPickerOpen(false)}
                        />
                        {filterLocation && (
                            <Button
                                variant="secondary"
                                onClick={clearLocationFilter}
                                style={{ padding: "0.5rem", fontSize: "0.75rem" }}
                            >
                                Vymazat
                            </Button>
                        )}
                    </div>
                </div>

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
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "300px", overflowY: "auto" }}>
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

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "auto" }}>
                    <Button variant="secondary" onClick={handleClose}>
                        Storno
                    </Button>
                    <Button 
                        onClick={handleConfirm}
                        disabled={!selectedItem}
                        icon="check"
                    >
                        Vybrat položku
                    </Button>
                </div>
            </div>
        </CenteredModal>
    );
}

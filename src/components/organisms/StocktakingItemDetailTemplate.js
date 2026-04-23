import React, { useRef, useLayoutEffect } from "react";
import PictureInput from "@/components/molecules/PictureInput";
import CardContainer from "@/components/atoms/CardContainer";
import DetailCardRow from "@/components/atoms/DetailCardRow";
import { ContextButton, ContextRow } from "@/components/molecules/ContextMenu";
import Link from "next/link";
import LocationPicker from "@/components/organisms/LocationPicker";
import QRCodeInput from "@/components/molecules/QRCodeInput";
import TextInput from "@/components/atoms/TextInput";
import ItemPropertyEditor from "@/components/molecules/ItemPropertyEditor";

export default function StocktakingItemDetailTemplate({
  item,
  editItem,
  editMode,
  onEditItemChange,
  onEditModeChange,
  onDelete,
  onDuplicate,
  onSave,
  onMove,
  onFound,
  showMove = false,
  showFound = false,
  loading,
  error,
  returnTo = "/",
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  bottomPadding = 0,
  setBottomPadding,
  barRendered,
  setBarRendered,
  showInventoryDetails = true
}) {
  const bottomBarRef = useRef(null);
  useLayoutEffect(() => {
    if (editMode && barRendered && bottomBarRef.current && setBottomPadding) {
      setBottomPadding(bottomBarRef.current.offsetHeight);
    }
  }, [editMode, barRendered, setBottomPadding]);

  if (loading) return <div style={{ padding: 32 }}>Načítání...</div>;
  if (error) return <div style={{ padding: 32 }}>Chyba: {error.message}</div>;
  if (!item) return <div style={{ padding: 32 }}>Položka nenalezena</div>;

  return (
    <div className="relative min-h-screen flex flex-col">
      <main className="flex flex-col items-center" style={{ minHeight: "100vh", paddingBottom: bottomPadding }}>
        <div className="flex flex-col container">
          <Link
            href={returnTo}
            style={{
              position: "absolute",
              marginTop: "1rem",
              marginLeft: "1rem",
              background: "#000",
              color: "#fff",
              border: "none",
              borderRadius: 16,
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1100,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              textDecoration: "none"
            }}
          >
            <span className="material-icons-round" style={{ fontSize: 16 }}>
              {returnTo === "/" ? "home" : "arrow_back"}
            </span>
          </Link>
          {editMode ? (
            <>
              {editItem && (
                <>
                  <PictureInput value={editItem.image || ""} editMode={false} />
                  <div className="p-4 flex flex-col gap-4">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, fontSize: 16, color: '#000' }}>{editItem.name}</span>
                      </div>
                      <TextInput
                        value={editItem.description}
                        onChange={e => onEditItemChange({ ...editItem, description: e.target.value })}
                        label={"Popisek"}
                        placeholder="Popisek"
                      />
                    </div>
                    <div style={{ width: '100%', height: 2, background: '#F0F1F3' }} />
                  {showInventoryDetails && (
                    <TextInput
                      value={editItem.note}
                      onChange={e => onEditItemChange({ ...editItem, note: e.target.value })}
                      label={"Poznámka k inventuře"}
                      placeholder="Poznámka k inventuře"
                      multiline
                    />
                  )}
                  <LocationPicker
                    value={editItem.location}
                    editMode={false}
                  />
                    <QRCodeInput
                      value={editItem.qr}
                      onChange={code => onEditItemChange({ ...editItem, qr: code })}
                      editMode={false}
                    />
                    {editItem.properties && Array.isArray(editItem.properties) && editItem.properties.length > 0 && (
                      <CardContainer className="gap-2">
                        {editItem.properties
                          .sort((a, b) => (a.priority || 0) - (b.priority || 0)) // Sort by priority
                          .map((prop, index) => {
                            const label = prop.label || prop.key || `Vlastnost ${index + 1}`;
                            const value = prop.value || '';
                            const key = prop.metaCode || prop.key || `prop_${index}`;
                            
                            return (
                              <DetailCardRow key={key} label={label + ':'} value={value} />
                            );
                          })}
                      </CardContainer>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontStyle: 'italic', color: '#535353' }}>
                  {showInventoryDetails && <div>Poslední úprava {editItem.lastCheck || editItem.date}</div>}
                      <div>ID {editItem.id}</div>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <PictureInput value={item.image || ""} editMode={false} />
              <div className="p-4 flex flex-col gap-4">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: '#000' }}>{item.name}</span>
                    <ContextButton>
                      <ContextRow
                        icon="edit"
                        label="Upravit"
                        action={onEditModeChange}
                      />
                      <ContextRow
                        icon="content_copy"
                        label="Duplikovat"
                        action={onDuplicate}
                      />
                      <ContextRow
                        icon="delete"
                        label="Smazat"
                        action={onDelete}
                        color="#FF6262"
                      />
                      {showMove && (
                        <ContextRow
                          icon="swap_horiz"
                          label="Přesun"
                          action={onMove}
                        />
                      )}
                      {showFound && (
                        <ContextRow
                          icon={item.state === 'nalezeno' ? 'visibility_off' : 'visibility'}
                          label={item.state === 'nalezeno' ? 'Nenalezeno' : 'Nalezeno'}
                          action={onFound}
                        />
                      )}
                    </ContextButton>
                  </div>
                  <div style={{ fontSize: 12, color: "#535353" }}>{item.description}</div>
                </div>
                <div style={{ width: '100%', height: 2, background: '#F0F1F3' }} />
                {showInventoryDetails && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#535353' }}>
                    <div style={{ fontWeight: 500, fontSize: 12 }}>Poznámka k inventuře:</div>
                    <div style={{ fontStyle: 'italic', fontSize: 12 }}>{item.note}</div>
                  </div>
                )}
                <LocationPicker
                  value={item.location}
                  editMode={false}
                />
                <QRCodeInput
                  value={item.qr}
                  editMode={false}
                />
                                 {item.properties && Array.isArray(item.properties) && item.properties.length > 0 && (
                   <CardContainer className="gap-2">
                     {item.properties
                       .sort((a, b) => (a.priority || 0) - (b.priority || 0)) // Sort by priority
                       .map((prop, index) => {
                         const label = prop.label || prop.key || `Vlastnost ${index + 1}`;
                         const value = prop.value || '';
                         const key = prop.metaCode || prop.key || `prop_${index}`;
                         
                         return (
                           <DetailCardRow key={key} label={label + ':'} value={value} />
                         );
                       })}
                   </CardContainer>
                 )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontStyle: 'italic', color: '#535353' }}>
                  {showInventoryDetails && <div>Poslední úprava {item.lastCheck}</div>}
                  <div>ID {item.id}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
} 
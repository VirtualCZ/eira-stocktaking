import React, { useRef, useLayoutEffect, useState } from "react";
import PictureInput from "../PictureInput";
import CardContainer from "../CardContainer";
import DetailCardRow from "../DetailCardRow";
import { ContextButton, ContextRow } from "../ContextMenu";
import Link from "next/link";
import CenteredModal from "../CenteredModal";
import SwipeToDelete from "../SwipeToDelete";
import LocationPicker from "./LocationPicker";
import QRCodeInput from "../QRCodeInput";
import TextInput from "../inputs/TextInput";
import ItemPropertyEditor from "../molecules/ItemPropertyEditor";

export default function StocktakingItemDetailTemplate({
  item,
  editItem,
  editMode,
  onEditItemChange,
  onEditModeChange,
  onDelete,
  onDuplicate,
  onSave,
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
  setBarRendered
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
                  <PictureInput value={editItem.image || ""} onChange={img => onEditItemChange({ ...editItem, image: img })} editMode={true} />
                  <div className="p-4 flex flex-col gap-4">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <TextInput
                          value={editItem.name}
                          onChange={e => onEditItemChange({ ...editItem, name: e.target.value })}
                          label={"Název"}
                          placeholder="Název"
                        />
                      </div>
                      <TextInput
                        value={editItem.description}
                        onChange={e => onEditItemChange({ ...editItem, description: e.target.value })}
                        label={"Popisek"}
                        placeholder="Popisek"
                      />
                    </div>
                    <div style={{ width: '100%', height: 2, background: '#F0F1F3' }} />
                    <TextInput
                      value={editItem.note}
                      onChange={e => onEditItemChange({ ...editItem, note: e.target.value })}
                      label={"Poznámka"}
                      placeholder="Poznámka"
                      multiline
                    />
                    <LocationPicker
                      value={editItem.location}
                      onChange={loc => onEditItemChange({ ...editItem, location: loc })}
                      editMode={true}
                    />
                    <QRCodeInput
                      value={editItem.qrCode}
                      onChange={code => onEditItemChange({ ...editItem, qrCode: code })}
                      editMode={true}
                    />
                    {editItem.properties && (
                      <ItemPropertyEditor
                        properties={Array.isArray(editItem.properties) ? editItem.properties : Object.entries(editItem.properties).map(([key, value]) => ({ key, value }))}
                        onChange={propsArr => onEditItemChange({ ...editItem, properties: propsArr })}
                      />
                    )}
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
                        label="Edit"
                        action={onEditModeChange}
                      />
                      <ContextRow
                        icon="content_copy"
                        label="Duplicate"
                        action={onDuplicate}
                      />
                      <ContextRow
                        icon="delete"
                        label="Delete"
                        action={onDelete}
                        color="#FF6262"
                      />
                      {showMove && (
                        <ContextRow
                          icon="swap_horiz"
                          label="Přesun"
                          action={() => alert('Přesun clicked')}
                        />
                      )}
                      {showFound && (
                        <ContextRow
                          icon="visibility"
                          label="Nalezeno"
                          action={() => alert('Nalezeno clicked')}
                        />
                      )}
                    </ContextButton>
                  </div>
                  <div style={{ fontSize: 12, color: "#535353" }}>{item.description}</div>
                </div>
                <div style={{ width: '100%', height: 2, background: '#F0F1F3' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#535353' }}>
                  <div style={{ fontWeight: 500, fontSize: 12 }}>Poznámka:</div>
                  <div style={{ fontStyle: 'italic', fontSize: 12 }}>{item.note}</div>
                </div>
                <LocationPicker
                  value={item.location}
                  editMode={false}
                />
                {item.properties && (
                  <CardContainer className="gap-2">
                    {(Array.isArray(item.properties)
                      ? item.properties
                      : Object.entries(item.properties).map(([key, value]) => ({ key, value }))
                    ).map(({ key, value }) => (
                      <DetailCardRow key={key} label={key + ':'} value={value} />
                    ))}
                  </CardContainer>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontStyle: 'italic', color: '#535353' }}>
                  <div>Poslední úprava {item.lastCheck}</div>
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
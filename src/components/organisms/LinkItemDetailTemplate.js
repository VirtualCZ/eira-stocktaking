import React from "react";
import PictureInput from "@/components/molecules/PictureInput";
import CardContainer from "@/components/atoms/CardContainer";
import DetailCardRow from "@/components/atoms/DetailCardRow";
import LocationPicker from "@/components/organisms/LocationPicker";
import QRCodeInput from "@/components/molecules/QRCodeInput";
import TextInput from "@/components/atoms/TextInput";
import NavBackLink from "@/components/molecules/NavBackLink";
import { HOME_PATH } from "@/utils/inventoryNavigation";
import PageLoadingScreen from "@/components/atoms/PageLoadingScreen";
import LinkInventuraStateSelect from "@/components/molecules/LinkInventuraStateSelect";
import { getEffectiveInvNumber } from "@/utils/inventoryStates";

export default function LinkItemDetailTemplate({
  item,
  onEditItemChange,
  returnTo = HOME_PATH,
  linkStatus,
  onLinkStatusChange,
}) {
  if (!item) return <PageLoadingScreen message="Položka nenalezena" />;

  return (
    <div className="relative min-h-screen flex flex-col">
      <main className="flex flex-col items-center" style={{ minHeight: "100vh" }}>
        <div className="flex flex-col container">
          <NavBackLink returnTo={returnTo} />
          <PictureInput value={item.image || ""} itemId={item.id} editMode={false} />
          <div className="p-4 flex flex-col gap-4" style={{ paddingBottom: "6rem" }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#000' }}>{item.name}</span>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openBaseItemPicker'))}
                  style={{
                    background: "#f0f0f0",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <span className="material-icons-round" style={{ fontSize: "16px" }}>link</span>
                  Změnit základní položku
                </button>
              </div>
              <div style={{ fontSize: 12, color: "#535353" }}>{item.description}</div>
            </div>
            <div style={{ width: '100%', height: 2, background: '#F0F1F3' }} />
            <TextInput
              value={item.note || ""}
              onChange={e => onEditItemChange({ ...item, note: e.target.value })}
              label={"Poznámka k inventuře"}
              placeholder="Poznámka k inventuře"
              multiline
            />
            <LocationPicker
              value={item.location}
              onChange={loc => onEditItemChange({ ...item, location: loc })}
              editMode={true}
            />
            <QRCodeInput
              value={item.qr}
              onChange={code => onEditItemChange({ ...item, qr: code })}
              editMode={false}
            />
            {item.baseItemId && !getEffectiveInvNumber(item) && (
              <div style={{ fontSize: 12, color: "#FF6262" }}>
                Položka nemá inventární číslo — nelze ji propojit.
              </div>
            )}
            {item.baseItemId && onLinkStatusChange != null && getEffectiveInvNumber(item) && (
              <LinkInventuraStateSelect
                value={linkStatus}
                onChange={onLinkStatusChange}
              />
            )}
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
            {/* Show ID without "last modified" */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontStyle: 'italic', color: '#535353' }}>
              <div>ID {item.id}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

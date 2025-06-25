"use client";
import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PictureInput from "@/components/PictureInput";
import CardContainer from "@/components/CardContainer";
import EditableField from "@/components/EditableField";
import Link from "next/link";
import LocationPicker from "@/components/LocationPicker";
import { useGetLocation } from "@/hooks/useLocation";

export default function NewItem() {
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo") || "/";
    const [newItem, setNewItem] = useState({
        name: "",
        note: "",
        weight: "",
        size: "",
        price: "",
        image: "",
        location: null
    });
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [location, setLocationState] = useState(null);
    const bottomBarRef = useRef(null);
    const [bottomPadding, setBottomPadding] = useState(0);

    const getLocation = useGetLocation();

    useLayoutEffect(() => {
        const updatePadding = () => {
            if (bottomBarRef.current) {
                setBottomPadding(bottomBarRef.current.offsetHeight);
            }
        };
        updatePadding();
        window.addEventListener("resize", updatePadding);
        return () => window.removeEventListener("resize", updatePadding);
    }, []);

    useEffect(() => {
        const loc = getLocation();
        if (loc) {
            setLocationState(loc);
            setNewItem(prev => ({ ...prev, location: loc }));
        }
    }, [getLocation]);

    const handleLocationSave = (newLoc) => {
        setLocationState(newLoc);
        setNewItem(prev => ({ ...prev, location: newLoc }));
        setIsLocationModalOpen(false);
    };

    const handleSave = () => {
        // Save logic here
        alert('Item saved!');
    };

    return (
        <div className="relative min-h-screen flex flex-col" style={{}}>
            {/* Floating nav button */}
            <main className="flex flex-col items-center" style={{ minHeight: "100vh", paddingBottom: bottomPadding }}>
                <div className="flex flex-col container" style={{}}>
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
                    <PictureInput value={newItem.image || ""} onChange={img => setNewItem({ ...newItem, image: img })} editMode={true} />
                    <div className="p-4 flex flex-col gap-4">
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <EditableField
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    label={"Název"}
                                    placeholder="Název"
                                />
                            </div>
                            <EditableField
                                value={newItem.note}
                                onChange={e => setNewItem({ ...newItem, note: e.target.value })}
                                label={"Popisek"}
                                placeholder="Popisek"
                            />
                        </div>
                        <div style={{ width: '100%', height: 2, background: '#F0F1F3' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#535353' }}>
                            <EditableField
                                value={newItem.note}
                                onChange={e => setNewItem({ ...newItem, note: e.target.value })}
                                label={"Poznámka"}
                                placeholder="Poznámka"
                                multiline
                            />
                        </div>
                        <LocationPicker
                            getter={() => newItem.location}
                            setter={loc => setNewItem(prev => ({ ...prev, location: loc }))}
                            editMode={true}
                        />
                        <CardContainer>
                            <EditableField value={newItem.weight || ''} onChange={e => setNewItem({ ...newItem, weight: e.target.value })} label={"Váha"} placeholder="30kg" />
                            <EditableField value={newItem.size || ''} onChange={e => setNewItem({ ...newItem, size: e.target.value })} label={"Velikost"} placeholder="10*20*30cm" />
                            <EditableField value={newItem.price || ''} onChange={e => setNewItem({ ...newItem, price: e.target.value })} label={"Cena"} placeholder="1234,-" />
                        </CardContainer>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontStyle: 'italic', color: '#535353' }}>
                            <div>Nový předmět</div>
                            <div>ID bude přiděleno automaticky</div>
                        </div>
                    </div>
                </div>
            </main>
            {/* Bottom bar for save/cancel */}
            <div
                ref={bottomBarRef}
                className="fixed left-0 right-0 bottom-0 z-[100] backdrop-blur-md flex justify-center"
                style={{
                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 20%)',
                }}
            >
                <div className="container flex items-center gap-2 p-4 justify-center">
                    <button
                        className="flex items-center gap-2 rounded-2xl bg-[#282828] p-3 text-white border-none cursor-pointer flex-1 justify-between"
                        style={{ fontSize: "0.75rem" }}
                        onClick={() => window.history.back()}
                    >
                        Zrušit
                        <span className="material-icons-round text-white" style={{ fontSize: "20px" }}>close</span>
                    </button>
                    <button
                        className="flex items-center gap-2 rounded-2xl bg-[#282828] p-3 text-white border-none cursor-pointer flex-1 justify-between"
                        onClick={handleSave}
                        style={{ fontSize: "0.75rem" }}
                    >
                        Uložit předmět
                        <span className="material-icons-round text-white" style={{ fontSize: "20px" }}>check</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
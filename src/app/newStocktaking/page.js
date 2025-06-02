"use client";

import Button from "@/components/Button";
import Card from "@/components/Card";
import TextInput from "@/components/TextInput";
import { useEffect, useState } from "react";
import LocationPickerModal from "@/components/LocationPickerModal";
import { useGetLocation } from "@/hooks/useLocation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createStocktaking } from "@/mockApi";

export default function NewStocktaking() {
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [note, setNote] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [location, setLocation] = useState(null);

    const router = useRouter();
    const getLocation = useGetLocation();

    useEffect(() => {
        const stored = getLocation();
        if (stored) {
            setLocation(stored);
        }
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !date || !note || !location) {
            alert("Vyplňte prosím všechna pole a vyberte lokaci.");
            return;
        }

        try {
            const { id } = await createStocktaking({
                name,
                date,
                note,
                location
            });

            router.push(`/stocktakingList/${id}`);
        } catch (err) {
            alert("Nepodařilo se vytvořit inventuru.");
            console.error(err);
        }
    };

    return (
        <div
            className="relative min-h-screen flex flex-col items-center"
            style={{ background: "#F2F3F5" }}
        >
            <main
                className="container"
                style={{
                    minHeight: "100vh",
                    background: "#F2F3F5",
                    display: "flex",
                    padding: "1rem",
                    flexDirection: "column",
                    gap: "1rem"
                }}
            >

                <div className="flex items-center mb-4">
                    <Link href="/" className="flex items-center">
                        <span className="material-icons-round" style={{ fontSize: "1.5rem" }}>
                            home
                        </span>
                    </Link>
                    <div className="w-px h-6 bg-black mx-2" />
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
                        Nová inventura
                    </h1>
                </div>
                <form onSubmit={handleSubmit}>
                    <Card>
                        <TextInput
                            label="Název"
                            placeholder="Zadejte název inventury"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                        <TextInput
                            label="Datum"
                            placeholder="Vyberte datum"
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                        <TextInput
                            label="Poznámka"
                            placeholder="Zadejte poznámku"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                        />
                        <div>
                            <Button type="button" onClick={() => setModalOpen(true)}>Upravit lokaci</Button>
                            {location && (
                                <div className="text-sm text-gray-600">
                                    Budova {location.budova}<br />Podlaží {location.podlazi}<br />Místnost {location.mistnost}
                                </div>
                            )}
                        </div>
                        <LocationPickerModal
                            isOpen={modalOpen}
                            onClose={() => setModalOpen(false)}
                            onSave={loc => setLocation(loc)}
                            initialLocation={location}
                        />
                        <Button type="submit">Vytvořit inventuru</Button>
                    </Card>
                </form>
            </main>
        </div>
    );
}
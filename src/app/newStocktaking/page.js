"use client";

import Button from "@/components/Button";
import Card from "@/components/Card";
import TextInput from "@/components/TextInput";
import { useEffect, useState } from "react";
import LocationPickerModal from "@/components/LocationPickerModal";
import { useGetLocation } from "@/hooks/useLocation";
import { useRouter } from "next/navigation";
import { createStocktaking } from "@/mockApi";
import PageHeading from "@/components/PageHeading";

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

        if (!name || !date || !location) {
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

                <PageHeading heading="Nová inventura" route="/" />

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
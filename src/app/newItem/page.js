"use client";

import Button from "@/components/Button";
import Card from "@/components/Card";
import PictureInput from "@/components/PictureInput";
import TextInput from "@/components/TextInput";

export default function NewItem() {
    return (
        <div
            className="relative min-h-screen flex flex-col items-center"
            style={{
                background: "#F2F3F5",
            }}
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
                <h1
                    style={{
                        fontSize: "1.5rem",
                        fontWeight: 600,
                        marginBottom: "1rem",
                    }}>
                    Nový předmět?
                </h1>

                <Card
                    name="Lokace"
                >
                    <PictureInput
                        label="Fotka"
                    />
                    <TextInput
                        label="Název"
                        placeholder="Zadejte název"
                    />
                    <TextInput
                        label="Popis"
                        placeholder="Zadejte popis"
                    />
                    <Button icon="qr_code">Upravit přes QR</Button>
                </Card>
            </main>
        </div>
    );
}
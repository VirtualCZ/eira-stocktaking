"use client";

import Button from "@/components/Button";
import Card from "@/components/Card";
import PageHeading from "@/components/PageHeading";
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

                <PageHeading heading="Nový předmět" route="/" />

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
                </Card>
            </main>
        </div>
    );
}
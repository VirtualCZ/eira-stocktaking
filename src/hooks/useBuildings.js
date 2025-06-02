import { useMemo } from "react";

export const buildings = [
    {
        value: "A",
        text: "Budova A",
        stories: [
            {
                value: "1",
                text: "1. podlaží",
                rooms: [
                    { value: "101", text: "Místnost 101 v budově A" },
                    { value: "102", text: "Místnost 102 v budově A" }
                ]
            },
            {
                value: "2",
                text: "2. podlaží",
                rooms: [
                    { value: "201", text: "Místnost 201 v budově A" },
                    { value: "202", text: "Místnost 202 v budově A" }
                ]
            }
        ]
    },
    {
        value: "B",
        text: "Budova B",
        stories: [
            {
                value: "1",
                text: "1. podlaží",
                rooms: [
                    { value: "103", text: "Místnost 103 v budově B" },
                    { value: "104", text: "Místnost 104 v budově B" }
                ]
            },
            {
                value: "3",
                text: "3. podlaží",
                rooms: [
                    { value: "301", text: "Místnost 301 v budově B" },
                    { value: "302", text: "Místnost 302 v budově B" }
                ]
            }
        ]
    }
];

export function useBuildings() {
    return useMemo(() => buildings, []);
}
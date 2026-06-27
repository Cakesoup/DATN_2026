import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { router } from "./app/router";
import { queryClient } from "./lib/queryClient";
import "./index.css";
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 2500,
                    style: {
                        borderRadius: '16px',
                        padding: '14px 16px',
                        fontSize: '14px',
                        background: '#ffffff',
                        color: '#0f172a',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)',
                    },
                    success: {
                        style: {
                            background: '#ecfdf5',
                            color: '#065f46',
                            border: '1px solid #a7f3d0',
                        },
                        iconTheme: {
                            primary: '#059669',
                            secondary: '#ecfdf5',
                        },
                    },
                    error: {
                        style: {
                            background: '#fef2f2',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                        },
                        iconTheme: {
                            primary: '#dc2626',
                            secondary: '#fef2f2',
                        },
                    },
                }}
            />
        </QueryClientProvider>
    </React.StrictMode>
);
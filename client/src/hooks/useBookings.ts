import { useState, useEffect } from "react";

export interface Booking {
  id: string;
  serviceType: "gas" | "electricity" | "water" | "waste";
  title: string;
  status: "pending" | "confirmed" | "in-progress" | "completed";
  details: Record<string, any>;
  createdAt: string;
  estimatedCompletion?: string;
}

const BOOKINGS_STORAGE_KEY = "suvidha_bookings";

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load bookings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (stored) {
      try {
        setBookings(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to load bookings:", error);
        setBookings([]);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save bookings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    }
  }, [bookings, isLoaded]);

  const addBooking = (
    serviceType: Booking["serviceType"],
    title: string,
    details: Record<string, any>,
    estimatedCompletion?: string,
  ): Booking => {
    const newBooking: Booking = {
      id: `${serviceType}-${Date.now()}`,
      serviceType,
      title,
      status: "confirmed",
      details,
      createdAt: new Date().toISOString(),
      estimatedCompletion,
    };

    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, ...updates } : booking,
      ),
    );
  };

  const getBookingById = (id: string) => {
    return bookings.find((b) => b.id === id);
  };

  const getBookingsByService = (serviceType: Booking["serviceType"]) => {
    return bookings.filter((b) => b.serviceType === serviceType);
  };

  const getAllBookings = () => bookings;

  const clearBookings = () => {
    setBookings([]);
    localStorage.removeItem(BOOKINGS_STORAGE_KEY);
  };

  return {
    bookings,
    isLoaded,
    addBooking,
    updateBooking,
    getBookingById,
    getBookingsByService,
    getAllBookings,
    clearBookings,
  };
}

import { supabase } from "@/lib/supabase";

export const ReservationsService = {
  // 1. Get available facilities (only ACTIVE ones)
  async getActiveFacilities() {
    const { data, error } = await supabase
      .from("facilities")
      .select(
        `
        *,
        type_facilities (
          id,
          name
        )
      `,
      )
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return data;
  },

  // 2. Get available slots using RPC
  async getAvailableSlots(facilityId, date) {
    const { data, error } = await supabase.rpc("get_available_slots", {
      input_facility_id: facilityId,
      input_date: date,
    });

    if (error) throw error;
    return data;
  },

  // 3. Create Reservation
  async createReservation({
    facility_id,
    user_id,
    date,
    start_time,
    end_time,
    price,
  }) {
    // Format tsrange: "[2026-01-30 10:00, 2026-01-30 11:00)"
    const startTimestamp = `${date} ${start_time}`;
    const endTimestamp = `${date} ${end_time}`;
    const bookedPeriod = `[${startTimestamp}, ${endTimestamp})`;

    const { data, error } = await supabase
      .from("reservations")
      .insert([
        {
          user_id,
          facility_id,
          booked_period: bookedPeriod,
          total_price: price,
          status: "pending", // Default, but good to be explicit
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 4. Get User Reservations
  async getUserReservations(userId) {
    const { data, error } = await supabase
      .from("reservations")
      .select(
        `
        *,
        facilities (
            name,
            image_urls
        ),
        payments (*)
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },
  // 5. Cancel Reservation
  async cancelReservation(reservationId) {
    const { data, error } = await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", reservationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

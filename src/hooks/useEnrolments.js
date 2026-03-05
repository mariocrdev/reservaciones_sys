import { useState, useCallback } from "react";
import { EnrolmentsService } from "@/services/enrolments.service";
import { useAuth } from "./useAuth";

export const useEnrolments = () => {
    const [enrolments, setEnrolments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const fetchUserEnrolments = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            setError(null);
            const data = await EnrolmentsService.getUserEnrolments(user.id);
            setEnrolments(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const addEnrolment = async (enrolmentData) => {
        try {
            setLoading(true);
            setError(null);

            // Si no especifican profile_id o child_id, asumimos que es para el perfil del logged in user
            const dataToInsert = {
                ...enrolmentData,
                enrolled_by: user.id,
                status: 'pending' // Siempre nacen como pending desde el lado del usuario
            };

            const data = await EnrolmentsService.createEnrolment(dataToInsert);
            await fetchUserEnrolments(); // Refetch para traer los joins completos
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    const cancelEnrolment = async (id) => {
        try {
            setLoading(true);
            setError(null);
            const data = await EnrolmentsService.cancelEnrolment(id);
            await fetchUserEnrolments();
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    return {
        enrolments,
        loading,
        error,
        fetchUserEnrolments,
        addEnrolment,
        cancelEnrolment
    };
};

export const useAdminEnrolments = () => {
    const [enrolments, setEnrolments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    const fetchAllEnrolments = useCallback(async (currentPage = page) => {
        try {
            setLoading(true);
            setError(null);
            const { data, count } = await EnrolmentsService.getAllEnrolments(currentPage, pageSize);
            setEnrolments(data || []);
            setTotalCount(count || 0);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [page]);

    return {
        enrolments,
        loading,
        error,
        page,
        setPage,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount,
        fetchAllEnrolments
    };
};

import React, { useState, useContext, useCallback, useEffect } from 'react';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/Auth.context';
import { LinksList } from '../components/LinksList';
import { Loader } from '../components/Loader';

export const LinksPage = () => {
    const [links, setLinks] = useState([]);
    const { token } = useContext(AuthContext);
    const { request, loading } = useHttp();

    const fetchLinks = useCallback(async () => {
        try {
            const fetched = await request(`/api/link`, 'GET', null, { Authorization: `Bearer ${token}` });
            setLinks(fetched);
        } catch (e) {}
    }, [token, request]);

    useEffect(() => {
        fetchLinks();
    }, [fetchLinks]);

    if (loading) {
        return <Loader />
    }

    return (
        <>
            {!loading && links && <LinksList links={links}/>}
        </>
    );
}
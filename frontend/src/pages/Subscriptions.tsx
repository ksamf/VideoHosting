import { useCallback } from "react"
import { getUserSubscriptionsVideo } from "../api/users"
import VideoGrid from "../components/video/VideoGrid"
import { useParams } from "react-router-dom"
import useFetch from "../hooks/useFetch"
import { PageError, PageLoading } from "../components/common/PageState"

export default function Subscriptions() {
    const { id } = useParams();
    const fetchSubscriptions = useCallback(
        () => (id ? getUserSubscriptionsVideo(id) : Promise.resolve([])),
        [id]
    );

    const {
        data: video,
        loading: videoLoading,
        error: videoError,
    } = useFetch(fetchSubscriptions);
    if (videoLoading) {
        return <PageLoading />;
    }
    if (videoError) {
        return <PageError error={videoError} />;
    }
    return (
        <>
            <VideoGrid videos={Array.isArray(video) ? video : []} />
        </>
    )
}

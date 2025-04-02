import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";

const PublicRoute = () => {
    const { isLoggedIn, userRole } = useStateContext();

    if (isLoggedIn) {
        return <Navigate to={`/${userRole}`} replace />;
    }

    return <Outlet />;
};

export default PublicRoute;


import { Navigate, Outlet } from 'react-router-dom';
import { useStateContext } from '../../contexts/ContextProvider';

const PrivateRoute = ({ allowedRoles }) => {
    const { isLoggedIn, userRole } = useStateContext();

    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" />;
    }

    return <Outlet />;
};

export default PrivateRoute;

import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
	const location = useLocation();
	const hideSidebar = location.pathname === '/register' || location.pathname === '/login';

	return (
		<div className="flex my-5 w-11/12 mx-auto">
			{!hideSidebar && <Sidebar />}
			<Outlet />
		</div>
	);
};

export default Layout;

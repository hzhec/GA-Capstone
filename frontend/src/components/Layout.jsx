import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useYoloContext } from './context/yolo-context';

const Layout = () => {
	const { authToken } = useYoloContext();
	// console.log(authToken.token);
	const location = useLocation();
	const hideSidebar =
		location.pathname === '/register' ||
		location.pathname === '/login' ||
		(location.pathname !== '/' &&
			location.pathname !== '/upload-image' &&
			location.pathname !== '/upload-video' &&
			location.pathname !== '/live-camera' &&
			location.pathname !== '/processed-images' &&
			location.pathname !== '/processed-videos');

	return (
		<div className="flex my-5 w-11/12 mx-auto">
			{!hideSidebar ? authToken.token ? <Sidebar /> : null : null}
			<Outlet />
		</div>
	);
};

export default Layout;

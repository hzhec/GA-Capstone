import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useYoloContext } from './context/yolo-context';

const Navbar = () => {
	const token = Cookies.get('token');
	const { setAuthToken } = useYoloContext();
	const navigate = useNavigate();

	const logoutHandler = () => {
		Cookies.remove('token');
		Cookies.remove('username');
		setAuthToken({ username: '', token: '' });
		setTimeout(() => {
			navigate('/login');
		}, 400);
	};

	return (
		<div className="mx-auto my-3 w-11/12">
			<div className="navbar bg-base-100 w-full shadow-lg mx-auto">
				<div className="flex-1">
					<Link to="/" className="btn btn-ghost normal-case text-xl">
						YOLOv8
					</Link>
				</div>
				<div className="flex-none">
					<ul className="menu menu-horizontal px-1">
						<li>
							<a>Link</a>
						</li>
						{token && (
							<li>
								<Link onClick={logoutHandler}>Logout</Link>
							</li>
						)}

						{!token && (
							<li>
								<details>
									<summary>Account</summary>
									<ul className="p-2 bg-base-100">
										<li>
											<Link to="/register">Register</Link>
										</li>
										<li>
											<Link to="/login">Login</Link>
										</li>
									</ul>
								</details>
							</li>
						)}
					</ul>
				</div>
			</div>
		</div>
	);
};

export default Navbar;

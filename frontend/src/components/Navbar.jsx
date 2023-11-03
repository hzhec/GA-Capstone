import { Link, useNavigate } from 'react-router-dom';
import { useYoloContext } from './context/yolo-context';
import Cookies from 'universal-cookie';

const Navbar = () => {
	const { authToken, setAuthToken, notifySuccess } = useYoloContext();
	const navigate = useNavigate();
	const cookies = new Cookies({ path: '/' });
	const token = authToken.id;

	const logoutHandler = () => {
		cookies.remove('id');
		cookies.remove('token');
		cookies.remove('username');
		setAuthToken({ id: '', username: '', token: '' });
		setTimeout(() => {
			navigate('/login');
			notifySuccess('Logout successful!');
		}, 300);
	};

	return (
		<div className="mx-auto my-5 w-11/12">
			<div className="navbar bg-[#ffffff83] w-full shadow-lg mx-auto border-solid border-[0.5px] border-[#d6d6d682] rounded-xl py-0.5 px-3">
				<div className="flex-1">
					<Link to="/" className="btn btn-ghost normal-case text-2xl">
						YOLOv8
					</Link>
				</div>
				<div className="flex-none">
					<ul className="menu menu-horizontal px-1 text-lg">
						{authToken.username && (
							<li>
								<div className="pointer-events-none hover:bg-transparent">
									Welcome, {authToken.username}!
								</div>
							</li>
						)}
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

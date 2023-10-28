import { Link, useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';
import { useYoloContext } from '../context/yolo-context';

const LoginForm = () => {
	const formRef = useRef();
	const socket = io('http://127.0.0.1:65432');
	const navigate = useNavigate();
	const { setAuthToken } = useYoloContext();

	const submitHandler = (event) => {
		event.preventDefault();
		const username = formRef.current['username'].value;
		const password = formRef.current['password'].value;

		if (username && password) {
			socket.emit('login_account', { username: username, password: password });
			formRef.current.reset();
			socket.on('login_status', (data) => {
				console.log(data.msg);
				if (data.status === 'success') {
					const token = Cookies.set('token', data.authToken);
					const username = Cookies.set('username', data.username);
					const id = Cookies.set('id', data.userId);
					setAuthToken({
						id: id,
						username: username,
						token: token,
					});
					setTimeout(() => {
						navigate('/');
					}, 400);
				}
			});
		}
	};

	const loginTestAccountHandler = () => {
		socket.emit('login_account', { username: 'test', password: 'password' });
		socket.on('login_status', (data) => {
			// console.log(data.msg);
			// console.log(data);
			if (data.status === 'success') {
				const token = Cookies.set('token', data.authToken);
				const username = Cookies.set('username', data.username);
				const id = Cookies.set('id', data.userId);
				setAuthToken({
					id: id,
					username: username,
					token: token,
				});
				setTimeout(() => {
					navigate('/');
				}, 400);
			}
		});
	};

	return (
		<>
			<section className="w-full">
				<div className="flex flex-col items-center justify-center px-6 py-8 mx-auto my-20">
					<div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 ">
						<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
							<h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
								Sign in to your account
							</h1>
							<form className="space-y-4 md:space-y-6" onClick={submitHandler} ref={formRef}>
								<div>
									<label className="block mb-2 text-sm font-medium text-gray-900 ">
										Username
									</label>
									<input
										type="text"
										id="username"
										className="bg-gray-50 border border-grey-500 text-grey-600 sm:text-sm rounded-lg focus:ring-primary focus:border-primary-600 block w-full p-2.5 "
										required
									/>
								</div>
								<div>
									<label className="block mb-2 text-sm font-medium text-gray-900 ">
										Password
									</label>
									<input
										type="password"
										id="password"
										className="bg-gray-50 border border-grey-500 text-grey-600 sm:text-sm rounded-lg focus:ring-primary focus:border-primary-600 block w-full p-2.5 "
										required
									/>
								</div>

								<button
									type="submit"
									className="w-full text-white bg-info font-medium rounded-lg text-sm px-5 py-2.5 text-center "
								>
									Login
								</button>
							</form>
							<p className="text-sm font-light text-gray-500">
								Don’t have an account yet?{' '}
								<Link to="/register" className="font-medium text-info hover:underline">
									Register here
								</Link>
							</p>
							<p className="text-sm font-light text-gray-500">
								Click{' '}
								<Link
									className="font-medium text-info hover:underline"
									onClick={loginTestAccountHandler}
								>
									here
								</Link>{' '}
								for test account.
							</p>
						</div>
					</div>
				</div>
			</section>
		</>
	);
};

export default LoginForm;

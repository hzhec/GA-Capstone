import { Link, useNavigate } from 'react-router-dom';
import { useRef } from 'react';
// import { io } from 'socket.io-client';
import { useYoloContext } from '../context/yolo-context';
import Cookies from 'universal-cookie';

const LoginForm = () => {
	const formRef = useRef();
	// const socket = io('http://127.0.0.1:65432');
	const navigate = useNavigate();
	const { setAuthToken, notifySuccess, notifyError } = useYoloContext();
	const cookies = new Cookies({ path: '/' });

	const submitHandler = (event) => {
		event.preventDefault();
		const username = formRef.current['username'].value;
		const password = formRef.current['password'].value;

		if (username && password) {
			fetch('http://127.0.0.1:65432/login_account', {
				method: 'POST',
				mode: 'cors',
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Request-Headers': '*',
					'Access-Control-Request-Method': '*',
				},
				body: JSON.stringify({ username: username, password: password }),
			})
				.then((response) => {
					return response.json();
				})
				.then((data) => {
					// console.log(data);
					if (data.status === 'success') {
						cookies.set('id', data.userId);
						cookies.set('username', data.username);
						cookies.set('token', data.authToken);
						setAuthToken({
							id: data.userId,
							username: data.username,
							token: data.authToken,
						});
						setTimeout(() => {
							notifySuccess(data.msg);
							navigate('/');
						}, 300);
					} else {
						notifyError(data.msg);
					}
				})
				.catch((err) => {
					console.log(err);
				});
			formRef.current.reset();
		}
	};

	const loginTestAccountHandler = () => {
		fetch('http://127.0.0.1:65432/login_account', {
			method: 'POST',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Request-Headers': '*',
				'Access-Control-Request-Method': '*',
			},
			body: JSON.stringify({ username: 'test', password: 'password' }),
		})
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				console.log(data);
				if (data.status === 'success') {
					cookies.set('id', data.userId);
					cookies.set('username', data.username);
					cookies.set('token', data.authToken);
					setAuthToken({
						id: data.userId,
						username: data.username,
						token: data.authToken,
					});
					setTimeout(() => {
						notifySuccess(data.msg);
						navigate('/');
					}, 300);
				} else {
					notifyError(data.msg);
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

import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { io } from 'socket.io-client';

const RegisterForm = () => {
	const formRef = useRef();
	const socket = io('http://127.0.0.1:65432');

	const submitHandler = (event) => {
		event.preventDefault();
		const username = formRef.current['username'].value;
		const password = formRef.current['password'].value;

		if (username && password) {
			socket.emit('register_account', { username: username, password: password });
			formRef.current.reset();
			socket.on('registration_status', (data) => {
				console.log(data.msg);
			});
		}
	};

	return (
		<>
			<section className="w-full">
				<div className="flex flex-col items-center justify-center px-6 py-8 mx-auto my-20">
					<div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 ">
						<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
							<h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
								Register an account
							</h1>
							<form
								className="space-y-4 md:space-y-6"
								onSubmit={submitHandler}
								ref={formRef}
							>
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
									Register
								</button>
								<p className="text-sm font-light text-gray-500">
									Have an account?{' '}
									<Link to="/login" className="font-medium text-info hover:underline">
										Login here
									</Link>
								</p>
							</form>
						</div>
					</div>
				</div>
			</section>
		</>
	);
};

export default RegisterForm;

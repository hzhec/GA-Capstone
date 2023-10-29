/* eslint-disable no-unused-vars */
import { createContext, useContext, useState } from 'react';
import Cookies from 'universal-cookie';
import toast from 'react-hot-toast';

const cookies = new Cookies({ path: '/' });

const YoloContext = createContext({
	authToken: {
		id: '',
		username: '',
		token: '',
	},
	setAuthToken: () => {},
	notifySuccess: (msg) => {},
	notifyError: (msg) => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useYoloContext = () => {
	return useContext(YoloContext);
};

const YoloProvider = (props) => {
	const [authToken, setAuthToken] = useState({
		id: cookies.get('id'),
		username: cookies.get('username'),
		token: cookies.get('token'),
	});

	const notifySuccess = (msg) => {
		toast.success(msg);
	};
	const notifyError = (msg) => toast.error(msg);

	return (
		<YoloContext.Provider value={{ authToken, setAuthToken, notifySuccess, notifyError }}>
			{props.children}
		</YoloContext.Provider>
	);
};

export default YoloProvider;

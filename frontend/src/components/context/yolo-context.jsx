import Cookies from 'js-cookie';
import { createContext, useContext, useState } from 'react';

const YoloContext = createContext({
	authToken: {
		id: '',
		username: '',
		token: '',
	},
	setAuthToken: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useYoloContext = () => {
	return useContext(YoloContext);
};

const YoloProvider = (props) => {
	const [authToken, setAuthToken] = useState({
		id: Cookies.get('id'),
		username: Cookies.get('username'),
		token: Cookies.get('token'),
	});
	return (
		<YoloContext.Provider value={{ authToken, setAuthToken }}>
			{props.children}
		</YoloContext.Provider>
	);
};

export default YoloProvider;

import { Route, Routes } from 'react-router-dom';
import './App.css';
import MainPage from './components/MainPage';
import Navbar from './components/Navbar';
import ProcessedImages from './components/ProcessedImages';
import UploadImageForm from './components/forms/UploadImageForm';
import UploadVideoForm from './components/forms/UploadVideoForm';
import ProcessedVideos from './components/ProcessedVideos';
import LiveCamForm from './components/forms/LiveCamForm';
import RegisterForm from './components/forms/RegisterForm';
import LoginForm from './components/forms/LoginForm';
import YoloProvider from './components/context/yolo-context';
import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';

function App() {
	return (
		<>
			<YoloProvider>
				<Toaster />
				<Navbar />
				<Routes>
					<Route path="/" element={<Layout />}>
						<Route path="/" element={<MainPage />} />
						<Route path="/login" element={<LoginForm />} />
						<Route path="/register" element={<RegisterForm />} />
						<Route path="/upload-image" element={<UploadImageForm />} />
						<Route path="/upload-video" element={<UploadVideoForm />} />
						<Route path="/live-camera" element={<LiveCamForm />} />
						<Route path="/processed-images" element={<ProcessedImages />} />
						<Route path="/processed-videos" element={<ProcessedVideos />} />
					</Route>
				</Routes>
			</YoloProvider>
		</>
	);
}

export default App;

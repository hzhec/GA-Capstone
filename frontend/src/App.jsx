import { Route, Routes } from 'react-router-dom';
import './App.css';
import MainContent from './components/MainContent';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProcessedImages from './components/ProcessedImages';
import UploadImageForm from './components/forms/UploadImageForm';
import UploadVideoForm from './components/forms/UploadVideoForm';
import ProcessedVideos from './components/ProcessedVideos';
import LiveCamForm from './components/forms/LiveCamForm';

function App() {
	return (
		<div className="mx-auto my-3 w-11/12">
			<Navbar />
			<div className="flex my-5 w-full">
				<Sidebar />
				<Routes>
					<Route path="/" element={<MainContent />} />
					<Route path="/upload-image" element={<UploadImageForm />} />
					<Route path="/upload-video" element={<UploadVideoForm />} />
					<Route path="/live-camera" element={<LiveCamForm />} />
					<Route path="/processed-images" element={<ProcessedImages />} />
					<Route path="/processed-videos" element={<ProcessedVideos />} />
				</Routes>
			</div>
		</div>
	);
}

export default App;

import { Route, Routes } from 'react-router-dom';
import './App.css';
import MainContent from './components/MainContent';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TrackedImages from './components/TrackedImages';
import UploadImageForm from './components/forms/UploadImageForm';

function App() {
	return (
		<div className="mx-auto my-3 w-11/12">
			<Navbar />
			<div className="flex my-5 w-full">
				<Sidebar />
				<Routes>
					<Route path="/" element={<MainContent />} />
					<Route path="/upload-image" element={<UploadImageForm />} />
					<Route path="/tracked-images" element={<TrackedImages />} />
				</Routes>
			</div>
		</div>
	);
}

export default App;

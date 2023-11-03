import { Link } from 'react-router-dom';

const Sidebar = () => {
	return (
		<ul className="bg-[#ffffff82] relative pl-3 overflow-y-scroll w-[17%] h-[65rem]">
			<li className="menu flex flex-col w-full font-medium">
				<details>
					<summary className="select-none flex items-center px-4 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
						<div className="flex items-center flex-grow text-[1.2rem]  text-stone-600 hover:text-stone-900 hover:-translate-y-1 hover:scale-110 duration-200">
							Upload
						</div>
					</summary>
					<div>
						<span className="select-none flex items-center w-[80%] pl-5 cursor-pointer my-[.4rem] rounded-[.95rem]">
							<Link
								to="/upload-image"
								className="btn bg-transparent border-none flex items-center flex-grow text-[1.05rem] text-stone-600 hover:text-stone-900 hover:-translate-y-1 hover:scale-110 duration-200 hover:bg-stone-100"
							>
								Image
							</Link>
						</span>
					</div>

					<div>
						<span className="select-none flex items-center w-[80%] pl-5	 cursor-pointer my-[.4rem] rounded-[.95rem]">
							<Link
								to="/upload-video"
								className="btn bg-transparent border-none flex items-center flex-grow text-[1.05rem]  text-stone-600 hover:text-stone-900 hover:-translate-y-1 hover:scale-110 duration-200 hover:bg-stone-100"
							>
								Video
							</Link>
						</span>
					</div>
				</details>

				<details>
					<summary className="select-none flex items-center px-4 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
						<div className="flex items-center flex-grow text-[1.2rem]  text-stone-600 hover:text-stone-900 hover:-translate-y-1 hover:scale-110 duration-200">
							Processed
						</div>
					</summary>
					<div>
						<span className="select-none flex items-center w-[80%] pl-5	 cursor-pointer my-[.4rem] rounded-[.95rem]">
							<Link
								to="/processed-images"
								className="btn bg-transparent border-none flex items-center flex-grow text-[1.05rem]  text-stone-600 hover:text-stone-900 hover:-translate-y-1 hover:scale-110 duration-200 hover:bg-stone-100"
							>
								Images
							</Link>
						</span>
					</div>

					<div>
						<span className="select-none flex items-center w-[80%] pl-5	 cursor-pointer my-[.4rem] rounded-[.95rem]">
							<Link
								to="/processed-videos"
								className="btn bg-transparent border-none flex items-center flex-grow text-[1.05rem]  text-stone-600 hover:text-stone-900 hover:-translate-y-1 hover:scale-110 duration-200 hover:bg-stone-100"
							>
								Videos
							</Link>
						</span>
					</div>
				</details>

				<div className="p-0">
					<span className="select-none flex items-center px-4 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
						<Link
							to="/live-camera"
							className="flex items-center flex-grow text-[1.2rem] text-stone-600 hover:text-stone-900 hover:-translate-y-1 hover:scale-110 duration-200"
						>
							Live Camera
						</Link>
					</span>
				</div>
			</li>
		</ul>
	);
};

export default Sidebar;

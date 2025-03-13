import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Adm_Sidebar = () => {
  const [showSubmenu, setShowSubmenu] = useState(false);
    const [showAnalyticsSubmenu, setShowAnalyticsSubmenu] = useState(false);
    const navigate = useNavigate();

    const handleNavigation = (path) => {
      navigate(path);
    };

  const toggleSubmenu = () => {
    setShowSubmenu(!showSubmenu);
  };
  const toggleAnalyticsSubmenu = () =>
    setShowAnalyticsSubmenu(!showAnalyticsSubmenu);

  return (
    <div className="fixed left-0 top-0 w-64 h-full   p-5 font-sans z-50">
      <h2 className="text-blue-700 text-4xl font-bold mb-12 font-sans">
        Aptitude
      </h2>
      <ul className="list-none p-0 m-0">
        <li className="flex items-center p-2 text-black cursor-pointer transition-colors duration-300 hover:text-blue-500 "
        onClick={() => handleNavigation("/admin")}
        >
          <span className="mr-2 flex items-center justify-center w-6 h-6 ">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.318 13.5H15.443C14.9293 13.4995 14.4364 13.7027 14.0724 14.065C13.7083 14.4274 13.5029 14.9193 13.501 15.433V19.308C13.5007 19.5631 13.5508 19.8158 13.6483 20.0515C13.7458 20.2872 13.8888 20.5014 14.0692 20.6818C14.2496 20.8622 14.4638 21.0052 14.6995 21.1027C14.9353 21.2002 15.1879 21.2503 15.443 21.25H19.318C19.8315 21.2479 20.3232 21.0423 20.6853 20.6783C21.0475 20.3142 21.2505 19.8215 21.25 19.308V15.433C21.2503 15.1792 21.2005 14.9279 21.1035 14.6933C21.0065 14.4588 20.8642 14.2457 20.6847 14.0663C20.5053 13.8868 20.2922 13.7445 20.0577 13.6475C19.8231 13.5505 19.5718 13.5007 19.318 13.501M8.557 13.5H4.682C4.16859 13.5029 3.67721 13.7089 3.3152 14.073C2.95319 14.437 2.74999 14.9296 2.75 15.443V19.318C2.74974 19.5718 2.79953 19.8231 2.89653 20.0577C2.99353 20.2922 3.13583 20.5053 3.31528 20.6847C3.49474 20.8642 3.70783 21.0065 3.94235 21.1035C4.17687 21.2005 4.42821 21.2503 4.682 21.25H8.557C9.07048 21.2505 9.56324 21.0475 9.92726 20.6853C10.2913 20.3232 10.4969 19.8315 10.499 19.318V15.443C10.4993 15.1879 10.4492 14.9353 10.3517 14.6995C10.2542 14.4638 10.1112 14.2496 9.93079 14.0692C9.75041 13.8888 9.53622 13.7458 9.30048 13.6483C9.06475 13.5508 8.8121 13.5007 8.557 13.501M8.557 2.75H4.682C4.42821 2.74974 4.17687 2.79953 3.94235 2.89653C3.70783 2.99353 3.49474 3.13583 3.31528 3.31528C3.13583 3.49474 2.99353 3.70783 2.89653 3.94235C2.79953 4.17687 2.74974 4.42821 2.75 4.682V8.557C2.74947 9.07048 2.95253 9.56324 3.31468 9.92726C3.67683 10.2913 4.16852 10.4969 4.682 10.499H8.557C8.8121 10.4993 9.06475 10.4492 9.30048 10.3517C9.53622 10.2542 9.75041 10.1112 9.93079 9.93079C10.1112 9.75041 10.2542 9.53622 10.3517 9.30048C10.4492 9.06475 10.4993 8.8121 10.499 8.557V4.682C10.4969 4.16852 10.2913 3.67683 9.92726 3.31468C9.56324 2.95253 9.07048 2.74947 8.557 2.75ZM19.318 2.75H15.443C14.9295 2.74947 14.4368 2.95253 14.0727 3.31468C13.7087 3.67683 13.5031 4.16852 13.501 4.682V8.557C13.5013 9.07197 13.706 9.56577 14.0701 9.92991C14.4342 10.294 14.928 10.4987 15.443 10.499H19.318C19.8315 10.4969 20.3232 10.2913 20.6853 9.92726C21.0475 9.56324 21.2505 9.07048 21.25 8.557V4.682C21.2503 4.42821 21.2005 4.17687 21.1035 3.94235C21.0065 3.70783 20.8642 3.49474 20.6847 3.31528C20.5053 3.13583 20.2922 2.99353 20.0577 2.89653C19.8231 2.79953 19.5718 2.74974 19.318 2.75Z"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <Link to="/admin">Home</Link>
        </li>
        <li className="flex items-center p-2 text-black cursor-pointer transition-colors duration-300 hover:text-blue-500 "
        onClick={() => handleNavigation("/admin/studentlist")}
        >
          <span className="mr-2 flex items-center justify-center w-6 h-6 ">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.2324 9.90039C10.2324 9.1635 10.3776 8.43383 10.6596 7.75303C10.9416 7.07223 11.3549 6.45364 11.8759 5.93258C12.397 5.41152 13.0156 4.99819 13.6964 4.7162C14.3772 4.4342 15.1069 4.28906 15.8438 4.28906C16.5806 4.28906 17.3103 4.4342 17.9911 4.7162C18.6719 4.99819 19.2905 5.41152 19.8116 5.93258C20.3326 6.45364 20.7459 7.07223 21.0279 7.75303C21.3099 8.43383 21.4551 9.1635 21.4551 9.90039C21.4551 11.3886 20.8639 12.8159 19.8116 13.8682C18.7592 14.9205 17.332 15.5117 15.8438 15.5117C14.3555 15.5117 12.9283 14.9205 11.8759 13.8682C10.8236 12.8159 10.2324 11.3886 10.2324 9.90039ZM15.8438 6.26953C14.8808 6.26953 13.9573 6.65207 13.2763 7.33299C12.5954 8.0139 12.2129 8.93743 12.2129 9.90039C12.2129 10.8634 12.5954 11.7869 13.2763 12.4678C13.9573 13.1487 14.8808 13.5312 15.8438 13.5312C16.8067 13.5312 17.7302 13.1487 18.4112 12.4678C19.0921 11.7869 19.4746 10.8634 19.4746 9.90039C19.4746 8.93743 19.0921 8.0139 18.4112 7.33299C17.7302 6.65207 16.8067 6.26953 15.8438 6.26953ZM10.5625 19.4727C9.77462 19.4727 9.01901 19.7856 8.4619 20.3428C7.90478 20.8999 7.5918 21.6555 7.5918 22.4434V24.0119C7.5918 24.0357 7.60896 24.0568 7.63273 24.0607C13.0711 24.948 18.6177 24.948 24.0548 24.0607C24.066 24.0582 24.076 24.052 24.0834 24.0432C24.0908 24.0344 24.0951 24.0234 24.0957 24.0119V22.4434C24.0957 21.6555 23.7827 20.8999 23.2256 20.3428C22.6685 19.7856 21.9129 19.4727 21.125 19.4727H20.6761C20.6408 19.4733 20.6057 19.4786 20.5718 19.4885L19.4297 19.8621C17.0996 20.623 14.5879 20.623 12.2578 19.8621L11.1144 19.4885C11.0813 19.4788 11.0472 19.4735 11.0127 19.4727H10.5625ZM5.61133 22.4434C5.61133 21.1302 6.13297 19.8709 7.06149 18.9424C7.99002 18.0138 9.24937 17.4922 10.5625 17.4922H11.0114C11.2579 17.4931 11.4973 17.5309 11.7297 17.6057L12.873 17.9794C14.8034 18.6096 16.8841 18.6096 18.8145 17.9794L19.9578 17.6057C20.1889 17.5305 20.4318 17.4922 20.6748 17.4922H21.125C22.4381 17.4922 23.6975 18.0138 24.626 18.9424C25.5545 19.8709 26.0762 21.1302 26.0762 22.4434V24.0119C26.0762 25.0074 25.3553 25.855 24.373 26.0148C18.7242 26.9368 12.9633 26.9368 7.31453 26.0148C6.83946 25.9366 6.40754 25.6924 6.09565 25.3257C5.78376 24.9589 5.61213 24.4933 5.61133 24.0119V22.4434Z"
                fill="#000000"
              />
            </svg>
          </span>
          <Link to="/admin/studentlist">Student</Link>
        </li>

        <li
          className="flex items-center p-2 text-black cursor-pointer transition-colors duration-300 hover:text-blue-500"
          onClick={toggleSubmenu}
        >
          <span className="mr-2 flex items-center justify-center w-6 h-6">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.1003 2.39077C14.8335 1.67227 15.8206 1.27216 16.8471 1.27739C17.8736 1.28263 18.8566 1.69277 19.5824 2.41871C20.3082 3.14464 20.7182 4.12768 20.7232 5.1542C20.7283 6.18071 20.328 7.16774 19.6093 7.90077L12.0153 15.4948C11.5873 15.9228 11.3253 16.1848 11.0353 16.4118C10.6919 16.6793 10.3204 16.9086 9.92734 17.0958C9.59334 17.2548 9.24234 17.3718 8.66834 17.5628L5.99634 18.4538L5.35434 18.6678C5.07269 18.7619 4.7704 18.7756 4.48137 18.7075C4.19234 18.6394 3.92802 18.492 3.71804 18.2821C3.50807 18.0721 3.36075 17.8078 3.29263 17.5187C3.2245 17.2297 3.23825 16.9274 3.33234 16.6458L4.43734 13.3318C4.62834 12.7578 4.74534 12.4068 4.90434 12.0728C5.09185 11.68 5.32153 11.3088 5.58934 10.9658C5.81634 10.6748 6.07734 10.4128 6.50534 9.98577L14.1003 2.39077ZM5.96034 16.8848L5.11634 16.0388L5.84434 13.8538C6.05634 13.2178 6.14434 12.9588 6.25834 12.7188C6.39967 12.4234 6.57067 12.1468 6.77134 11.8888C6.93534 11.6788 7.12734 11.4848 7.60134 11.0098L13.4923 5.11977C13.7984 5.88452 14.2575 6.5787 14.8413 7.15977C15.4225 7.74327 16.1167 8.20197 16.8813 8.50777L10.9903 14.3978C10.5153 14.8728 10.3223 15.0648 10.1123 15.2278C9.85367 15.4291 9.57701 15.6004 9.28234 15.7418C9.04234 15.8558 8.78234 15.9438 8.14634 16.1558L5.96034 16.8848ZM18.0763 7.31177C17.9223 7.27778 17.7703 7.23471 17.6213 7.18277C16.9728 6.95738 16.3845 6.58659 15.9013 6.09877C15.4146 5.61476 15.044 5.02668 14.8173 4.37877C14.7651 4.2298 14.7217 4.07787 14.6873 3.92377L15.1603 3.45177C15.6121 3.0146 16.2176 2.77248 16.8462 2.77764C17.4748 2.78279 18.0763 3.0348 18.5208 3.47933C18.9653 3.92385 19.2173 4.52528 19.2225 5.15391C19.2276 5.78254 18.9855 6.38802 18.5483 6.83977L18.0763 7.31177ZM3.25034 21.9998C3.25034 21.8009 3.32936 21.6101 3.47001 21.4694C3.61066 21.3288 3.80143 21.2498 4.00034 21.2498H20.0003V22.7498H4.00034C3.80143 22.7498 3.61066 22.6708 3.47001 22.5301C3.32936 22.3895 3.25034 22.1987 3.25034 21.9998Z"
                fill="black"
              />
            </svg>
          </span>
          All Tests
          <span className={`ml-auto ${showSubmenu ? "rotate-180" : ""}`}>
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L5 5L9 1"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </li>

        {showSubmenu && (
          <ul className="pl-5 mt-1">
            <li className="p-1 ml-4 text-black cursor-pointer transition-colors duration-300 hover:text-blue-500">
              <Link to="/drafted-tests">Drafted Tests</Link>
            </li>
            <li className="p-1 ml-4 text-black cursor-pointer transition-colors duration-300 hover:text-blue-500">
              <Link to="/scheduled-tests">Schedule Tests</Link>
            </li>
            <li className="p-1 ml-4 text-black cursor-pointer transition-colors duration-300 hover:text-blue-500">
              <Link to="/past-tests"> Past Test</Link>
            </li>
            <li className="p-1 ml-4 text-black cursor-pointer transition-colors duration-300 hover:text-blue-500">
              <Link to="/live-tests"> Live Test</Link>
            </li>
          </ul>
        )}
        <li
          className="flex items-center p-2 text-black cursor-pointer transition-colors duration-300 hover:text-blue-500"
          onClick={toggleAnalyticsSubmenu}
        >
          <span className="mr-2 flex items-center justify-center w-6 h-6">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17ZM19 19H5V5H12V3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V12H19V19Z"
                fill="black"
              />
            </svg>
          </span>
          Analytics
          <span
            className={`ml-auto ${showAnalyticsSubmenu ? "rotate-180" : ""}`}
          >
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L5 5L9 1"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </li>

        {showAnalyticsSubmenu && (
          <ul className="pl-5 mt-1">
            <li className="p-1 ml-4 text-black cursor-pointer transition-colors duration-300 hover:text-blue-500">
              <Link to="/admin/overall-score">Overall Analysis</Link>
            </li>
            <li className="p-1 ml-4 text-black cursor-pointer transition-colors duration-300 hover:text-blue-500">
              <Link to="/admin/analytics">Branch Analytics</Link>
            </li>
            <li className="p-1 ml-4 text-black cursor-pointer transition-colors duration-300 hover:text-blue-500">
              <Link to="/admin/student-analysis">Student Analysis</Link>
            </li>
            
          </ul>
        )}
      </ul>
    </div>
  );
};

export default Adm_Sidebar;

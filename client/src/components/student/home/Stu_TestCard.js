import React from 'react';
import { useNavigate } from "react-router-dom";

const Stu_TestCard = ({ testName, questionCount, duration, lastDate, examId,status  }) => {

  const navigate = useNavigate();
  // console.log('test exam id is ', examId);
  

 const  handleChange = async () => {
   navigate("/test-instruction" ,{state :{examId : examId ,Duration :duration}})
    
 }
 

  return (
    <div className="border rounded-lg shadow-md p-3  max-w-lg relative">
      <div className="flex justify-between items-center mb-4">
        <div className='w-1 h-7 bg-black ml-[-12px] rounded-r-md'></div>
        <div className=' border border-gray-600 rounded-md px-4 py-1 flex items-center mr-auto ml-5'>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M9.29594 3.33294L12.6699 6.70627L6.0446 13.3329C5.85985 13.5177 5.63004 13.651 5.37794 13.7196L1.96794 14.6496C1.88293 14.6727 1.79334 14.6729 1.70823 14.6502C1.62312 14.6275 1.54552 14.5827 1.48327 14.5204C1.42102 14.4581 1.37634 14.3804 1.35375 14.2953C1.33115 14.2102 1.33145 14.1206 1.3546 14.0356L2.28394 10.6249C2.35267 10.3731 2.48595 10.1435 2.6706 9.95894L9.29594 3.33294ZM4.35327 7.33294L3.35327 8.33294H1.83594C1.70333 8.33294 1.57615 8.28026 1.48238 8.18649C1.38862 8.09272 1.33594 7.96555 1.33594 7.83294C1.33594 7.70033 1.38862 7.57315 1.48238 7.47938C1.57615 7.38562 1.70333 7.33294 1.83594 7.33294H4.35327ZM13.9213 1.8836L14.0233 1.9796L14.1199 2.0816C14.5239 2.53656 14.7389 3.12862 14.7209 3.73679C14.703 4.34495 14.4534 4.9233 14.0233 5.35361L13.3766 5.99961L10.0026 2.62627L10.6493 1.9796C11.0797 1.54956 11.6581 1.30012 12.2662 1.28228C12.8744 1.26443 13.4664 1.47953 13.9213 1.8836ZM7.01994 4.66627L6.01994 5.66627H1.83594C1.70333 5.66627 1.57615 5.61359 1.48238 5.51982C1.38862 5.42606 1.33594 5.29888 1.33594 5.16627C1.33594 5.03366 1.38862 4.90649 1.48238 4.81272C1.57615 4.71895 1.70333 4.66627 1.83594 4.66627H7.01994ZM9.6866 1.9996L8.6866 2.9996H1.83594C1.70333 2.9996 1.57615 2.94693 1.48238 2.85316C1.38862 2.75939 1.33594 2.63221 1.33594 2.4996C1.33594 2.367 1.38862 2.23982 1.48238 2.14605C1.57615 2.05228 1.70333 1.9996 1.83594 1.9996H9.6866Z" fill="black" />
          </svg>
          <h1 className='ml-2 text-sm'>{status}</h1>
        </div>
        <span className="text-xs text-black font-medium">Created on: {lastDate}</span>
      </div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{testName}</h2>
      <div className="flex items-center mr-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M14.4054 15.5586H7.78711C7.40761 15.5586 7.09961 15.2506 7.09961 14.8711C7.09961 14.4916 7.40761 14.1836 7.78711 14.1836H14.4054C14.7849 14.1836 15.0929 14.4916 15.0929 14.8711C15.0929 15.2506 14.7849 15.5586 14.4054 15.5586" fill="black" />
          <path fill-rule="evenodd" clip-rule="evenodd" d="M14.4054 11.7188H7.78711C7.40761 11.7188 7.09961 11.4108 7.09961 11.0313C7.09961 10.6518 7.40761 10.3438 7.78711 10.3438H14.4054C14.7849 10.3438 15.0929 10.6518 15.0929 11.0313C15.0929 11.4108 14.7849 11.7188 14.4054 11.7188" fill="black" />
          <path fill-rule="evenodd" clip-rule="evenodd" d="M10.3125 7.89063H7.78711C7.40761 7.89063 7.09961 7.58263 7.09961 7.20313C7.09961 6.82363 7.40761 6.51562 7.78711 6.51562H10.3125C10.692 6.51562 11 6.82363 11 7.20313C11 7.58263 10.692 7.89063 10.3125 7.89063" fill="black" />
          <mask id="mask0_1726_7343" maskUnits="userSpaceOnUse" x="2" y="1" width="18" height="20">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M2.75 1.83203H19.401V20.0827H2.75V1.83203Z" fill="white" />
          </mask>
          <g mask="url(#mask0_1726_7343)">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M14.5832 3.20703L7.535 3.2107C5.401 3.22353 4.125 4.54353 4.125 6.74261V15.1723C4.125 17.386 5.41292 18.7079 7.568 18.7079L14.6162 18.7051C16.7502 18.6923 18.0262 17.3704 18.0262 15.1723V6.74261C18.0262 4.52886 16.7392 3.20703 14.5832 3.20703ZM7.56892 20.0829C4.68692 20.0829 2.75 18.1093 2.75 15.1723V6.74261C2.75 3.77903 4.62642 1.85311 7.53042 1.8357L14.5823 1.83203H14.5833C17.4653 1.83203 19.4013 3.80561 19.4013 6.74261V15.1723C19.4013 18.1349 17.5248 20.0618 14.6208 20.0801L7.56892 20.0829Z" fill="black" />
          </g>
        </svg>
        <h1 className='font-medium text-sm ml-2'>{questionCount} Questions</h1>
      </div>
      <div className="flex items-center mr-4 mt-2 ">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M11.0007 3.20703C6.70423 3.20703 3.20898 6.70228 3.20898 10.9987C3.20898 15.2951 6.70423 18.7904 11.0007 18.7904C15.2971 18.7904 18.7923 15.2951 18.7923 10.9987C18.7923 6.70228 15.2971 3.20703 11.0007 3.20703M11.0007 20.1654C5.94615 20.1654 1.83398 16.0532 1.83398 10.9987C1.83398 5.9442 5.94615 1.83203 11.0007 1.83203C16.0552 1.83203 20.1673 5.9442 20.1673 10.9987C20.1673 16.0532 16.0552 20.1654 11.0007 20.1654" fill="black" />
          <path fill-rule="evenodd" clip-rule="evenodd" d="M14.1453 14.3845C14.0252 14.3845 13.9042 14.3533 13.7933 14.2882L10.3375 12.2267C10.1303 12.102 10.002 11.8774 10.002 11.6354V7.19141C10.002 6.81191 10.31 6.50391 10.6895 6.50391C11.0699 6.50391 11.377 6.81191 11.377 7.19141V11.2449L14.4982 13.1057C14.8236 13.301 14.9309 13.7227 14.7365 14.049C14.6073 14.2644 14.379 14.3845 14.1453 14.3845" fill="black" />
        </svg>
        <h1 className='font-medium text-sm ml-2'>{duration}</h1>
      </div>

      <button className="bg-blue-700 font-semibold text-white text-sm px-4 py-2 rounded-md shadow hover:bg-blue-800 absolute bottom-3 right-3" onClick={(e)=>{handleChange(e)}}>
        Start Test
      </button>
    </div>
  );
};

export default Stu_TestCard;

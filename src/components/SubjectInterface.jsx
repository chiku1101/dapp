import React, { useState, useEffect } from 'react';
import walletService from '../services/walletService';
import didService from '../services/didService';

const SubjectInterface = () => {
  const [did, setDid] = useState(null);
  const [isCreatingDid, setIsCreatingDid] = useState(false);
  const [didError, setDidError] = useState(null);
  const [credentials, setCredentials] = useState([]);

  useEffect(() => {
    // Check if user already has a DID
    const savedDid = localStorage.getItem('userDid');
    if (savedDid) {
      setDid(savedDid);
    }
  }, []);

  const createDID = async () => {
    setIsCreatingDid(true);
    setDidError(null);

    try {
      const signer = walletService.getSigner();
      const result = await didService.createDID(signer);

      if (result.success) {
        setDid(result.did);
        localStorage.setItem('userDid', result.did);
      } else {
        setDidError(result.error);
      }
    } catch (error) {
      setDidError(error.message);
    } finally {
      setIsCreatingDid(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const generateQRCode = () => {
    // This would generate a QR code for the DID
    // You could use a library like qrcode.js
    alert('QR Code generation would be implemented here');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">My Digital Identity</h2>
        
        {!did ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No DID Found</h3>
            <p className="text-gray-600 mb-4">
              Create your Decentralized Identity to start receiving and managing verifiable credentials.
            </p>
            <button
              onClick={createDID}
              disabled={isCreatingDid}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isCreatingDid ? 'Creating DID...' : 'Create My DID'}
            </button>
            
            {didError && (
              <div className="mt-4 text-red-600 text-sm">
                Error: {didError}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Your DID</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(did)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  Copy
                </button>
                <button
                  onClick={generateQRCode}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  QR Code
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-md p-3 font-mono text-sm break-all">
              {did}
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p>This is your unique Decentralized Identity. Share this with credential issuers to receive verifiable credentials.</p>
            </div>
          </div>
        )}
      </div>

      {did && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">My Credentials</h3>
          
          {credentials.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Credentials Yet</h4>
              <p className="text-gray-600">
                Once you receive verifiable credentials, they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {credentials.map((credential, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{credential.type}</h4>
                      <p className="text-sm text-gray-600">Issued by: {credential.issuer}</p>
                      <p className="text-sm text-gray-600">Date: {credential.date}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-800 text-sm">
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubjectInterface;
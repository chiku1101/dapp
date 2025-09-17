import React, { useState } from 'react';
import vcService from '../services/vcService';
import { useWallet } from '../hooks/useWallet';

const IssuerInterface = () => {
  const { account } = useWallet();
  const [formData, setFormData] = useState({
    subjectDID: '',
    credentialType: 'education',
    institution: '',
    degree: '',
    graduationDate: '',
    gpa: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const credentialTypes = [
    { value: 'education', label: 'Education Certificate', icon: '🎓', color: 'from-blue-500 to-cyan-500' },
    { value: 'employment', label: 'Employment Verification', icon: '💼', color: 'from-green-500 to-emerald-500' },
    { value: 'identity', label: 'Identity Document', icon: '🆔', color: 'from-purple-500 to-pink-500' },
    { value: 'skill', label: 'Skill Certification', icon: '🏆', color: 'from-yellow-500 to-orange-500' }
  ];

  // Enhanced input style for better visibility
  const inputStyle = {
    color: '#ffffff !important',
    caretColor: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.15) !important',
    WebkitTextFillColor: '#ffffff !important',
    opacity: '1 !important',
    WebkitOpacity: '1 !important'
  };

  const dateInputStyle = {
    ...inputStyle,
    colorScheme: 'dark'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    // Check wallet connection first
    if (!account) {
      setResult({
        type: 'error',
        message: 'Please connect your wallet first to issue credentials'
      });
      setIsLoading(false);
      return;
    }

    try {
      const credential = {
        type: formData.credentialType,
        subject: formData.subjectDID,
        claims: {
          institution: formData.institution,
          degree: formData.degree,
          graduationDate: formData.graduationDate,
          gpa: formData.gpa
        }
      };

      const response = await vcService.issueCredential(credential);
      
      if (response.success) {
        setResult({
          type: 'success',
          message: 'Credential issued successfully!',
          data: response
        });
        setFormData({
          subjectDID: '',
          credentialType: 'education',
          institution: '',
          degree: '',
          graduationDate: '',
          gpa: ''
        });
      } else {
        setResult({
          type: 'error',
          message: response.error || 'Failed to issue credential'
        });
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: error.message || 'An error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-500/30 mb-4">
            <span className="text-sm text-blue-300">🏛️ Credential Issuer</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Issue Verifiable Credentials</h2>
          <p className="text-xl text-gray-300">Create and issue tamper-proof digital credentials on the blockchain</p>
          
          {/* Wallet Connection Status */}
          {!account && (
            <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
              <p className="text-yellow-300">⚠️ Please connect your wallet to issue credentials</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Credential Type Selection */}
          <div>
            <label className="block text-lg font-semibold text-white mb-6">Select Credential Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {credentialTypes.map((type) => (
                <label
                  key={type.value}
                  className={`group relative cursor-pointer transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <input
                    type="radio"
                    name="credentialType"
                    value={type.value}
                    checked={formData.credentialType === type.value}
                    onChange={(e) => setFormData({ ...formData, credentialType: e.target.value })}
                    className="sr-only"
                  />
                  <div className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                    formData.credentialType === type.value
                      ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/25'
                      : 'border-white/20 bg-white/10 hover:border-white/30 hover:bg-white/15'
                  }`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center text-2xl shadow-lg`}>
                        {type.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{type.label}</h3>
                        <p className="text-sm text-gray-400">Professional verification</p>
                      </div>
                    </div>
                    {formData.credentialType === type.value && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Subject DID Input */}
          <div>
            <label className="block text-lg font-semibold text-white mb-4">
              Subject DID <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.subjectDID}
              onChange={(e) => setFormData({ ...formData, subjectDID: e.target.value })}
              placeholder="did:ethr:0x..."
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 font-mono text-sm"
              style={inputStyle}
              required
            />
            <p className="text-sm text-gray-400 mt-2">Enter the DID of the credential recipient</p>
          </div>

          {/* Institution Name Input */}
          <div>
            <label className="block text-lg font-semibold text-white mb-4">Institution Name</label>
            <input
              type="text"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              placeholder="University Name"
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
              style={inputStyle}
            />
          </div>

          {/* Degree Input */}
          <div>
            <label className="block text-lg font-semibold text-white mb-4">Degree</label>
            <input
              type="text"
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              placeholder="Bachelor of Science"
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
              style={inputStyle}
            />
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-lg font-semibold text-white mb-4">Graduation Date</label>
            <input
              type="date"
              value={formData.graduationDate}
              onChange={(e) => setFormData({ ...formData, graduationDate: e.target.value })}
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
              style={dateInputStyle}
            />
          </div>

          {/* GPA Input */}
          <div>
            <label className="block text-lg font-semibold text-white mb-4">GPA</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="4"
              value={formData.gpa}
              onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
              placeholder="3.85"
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
              style={inputStyle}
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading || !account}
              className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative flex items-center space-x-3">
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Issuing Credential...</span>
                  </>
                ) : !account ? (
                  <>
                    <span className="text-xl">🔌</span>
                    <span>Connect Wallet First</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">🏛️</span>
                    <span>Issue Credential</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </form>

        {/* Result Display */}
        {result && (
          <div className={`mt-8 p-6 rounded-2xl backdrop-blur-sm border animate-fadeIn ${
            result.type === 'success' 
              ? 'bg-green-500/20 border-green-500/30' 
              : 'bg-red-500/20 border-red-500/30'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">
                {result.type === 'success' ? '✅' : '❌'}
              </span>
              <p className={`font-semibold text-lg ${
                result.type === 'success' ? 'text-green-300' : 'text-red-300'
              }`}>
                {result.message}
              </p>
            </div>
            {result.data && (
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <p className="text-sm text-gray-300 mb-2">Credential ID: <span className="font-mono text-white">{result.data.credentialId}</span></p>
                {result.data.ipfsHash && (
                  <p className="text-sm text-gray-300">IPFS Hash: <span className="font-mono text-white">{result.data.ipfsHash}</span></p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IssuerInterface
import React, { useState } from 'react';
import vcService from '../services/vcService';

const VerifierInterface = () => {
  const [credentialId, setCredentialId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await vcService.verifyCredential(credentialId);
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-500/30 mb-4">
          <span className="text-sm text-green-300">✅ Credential Verifier</span>
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">Verify Credentials</h2>
        <p className="text-xl text-gray-300">Instantly verify the authenticity of any credential</p>
      </div>

      <form onSubmit={handleVerify} className="space-y-8">
        <div>
          <label className="block text-lg font-semibold text-white mb-4">Credential ID</label>
          <div className="relative">
            <input
              type="text"
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              placeholder="Enter credential ID to verify..."
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
              required
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <span className="text-gray-400">🔍</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={isLoading || !credentialId.trim()}
            className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-12 py-4 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative flex items-center space-x-3">
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">✅</span>
                  <span>Verify Credential</span>
                </>
              )}
            </div>
          </button>
        </div>
      </form>

      {/* Result Display */}
      {result && (
        <div className={`mt-8 p-6 rounded-2xl backdrop-blur-sm border animate-fadeIn ${
          result.success 
            ? 'bg-green-500/20 border-green-500/30' 
            : 'bg-red-500/20 border-red-500/30'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-3xl">
              {result.success ? '✅' : '❌'}
            </span>
            <div>
              <p className={`font-semibold text-xl ${
                result.success ? 'text-green-300' : 'text-red-300'
              }`}>
                {result.success ? 'Credential Verified!' : 'Verification Failed'}
              </p>
              <p className="text-gray-300">
                {result.success ? 'This credential is authentic and valid' : result.error}
              </p>
            </div>
          </div>
          
          {result.success && result.credential && (
            <div className="bg-white/10 rounded-xl p-6 border border-white/20 space-y-4">
              <h3 className="text-lg font-semibold text-white mb-3">Credential Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Type</p>
                  <p className="text-white font-medium">{result.credential.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Subject</p>
                  <p className="text-white font-mono text-sm">{result.credential.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Issued Date</p>
                  <p className="text-white font-medium">{new Date(result.credential.issuedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                    Valid
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifierInterface;
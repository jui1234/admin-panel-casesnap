/**
 * Response Decryption Utility
 * Decrypts AES-256-GCM encrypted responses from backend
 * Uses NEXT_PUBLIC_RESPONSE_ENCRYPTION_KEY from environment variables
 */

/**
 * Get key material from environment variable
 * Supports both 64-hex-char keys (raw 32-byte) and other strings (SHA-256 hashed)
 */
async function getKeyMaterial(): Promise<ArrayBuffer> {
  const keyStr = process.env.NEXT_PUBLIC_RESPONSE_ENCRYPTION_KEY || ''
  
  // Debug: Log if key is missing (only in development)
  if (process.env.NODE_ENV === 'development' && !keyStr) {
    console.warn(
      '⚠️ NEXT_PUBLIC_RESPONSE_ENCRYPTION_KEY not found. ' +
      'Please add it to .env or .env.local and restart your dev server.'
    )
  }
  
  if (!keyStr || keyStr.length < 16) {
    throw new Error(
      'NEXT_PUBLIC_RESPONSE_ENCRYPTION_KEY not found or invalid. ' +
      'Please add it to .env or .env.local file and restart your development server. ' +
      'The key should be at least 16 characters long.'
    )
  }

  // 64 hex chars = use as raw 32-byte key (matches backend)
  if (keyStr.length === 64 && /^[a-fA-F0-9]+$/.test(keyStr)) {
    const bytes = new Uint8Array(32)
    for (let i = 0; i < 64; i += 2) {
      bytes[i / 2] = parseInt(keyStr.substr(i, 2), 16)
    }
    return bytes.buffer
  }

  // Other strings: hash with SHA-256 (matches backend)
  const encoder = new TextEncoder()
  const data = encoder.encode(keyStr)
  return crypto.subtle.digest('SHA-256', data)
}

/**
 * Decrypt response data from backend (AES-256-GCM).
 * Backend sends data, iv, authTag separately; Web Crypto expects ciphertext|tag.
 * 
 * @param encryptedBase64 - Base64 encoded encrypted data
 * @param ivBase64 - Base64 encoded initialization vector
 * @param authTagBase64 - Base64 encoded authentication tag
 * @returns Decrypted data (parsed JSON)
 */
export async function decryptResponseData(
  encryptedBase64: string,
  ivBase64: string,
  authTagBase64: string
): Promise<any> {
  try {
    const keyMaterial = await getKeyMaterial()
    const key = await crypto.subtle.importKey(
      'raw',
      keyMaterial,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    )

    const encrypted = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0))
    const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0))
    const authTag = Uint8Array.from(atob(authTagBase64), (c) => c.charCodeAt(0))

    // Web Crypto expects ciphertext + authTag concatenated
    const ciphertext = new Uint8Array(encrypted.length + authTag.length)
    ciphertext.set(encrypted)
    ciphertext.set(authTag, encrypted.length)

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, tagLength: 128 },
      key,
      ciphertext
    )

    return JSON.parse(new TextDecoder().decode(decrypted))
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error(`Failed to decrypt response: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Check if response is encrypted and decrypt if needed
 * @param response - API response object
 * @returns Response with decrypted data if encrypted, otherwise original response
 */
export async function decryptResponseIfNeeded<T extends { encrypted?: boolean; data?: any; iv?: string; authTag?: string }>(
  response: T
): Promise<T> {
  if (response?.encrypted && response?.data && response?.iv && response?.authTag) {
    try {
      const decryptedData = await decryptResponseData(response.data, response.iv, response.authTag)
      return {
        ...response,
        data: decryptedData,
        encrypted: false, // Mark as decrypted
      } as T
    } catch (error) {
      console.error('Failed to decrypt response:', error)
      throw error
    }
  }
  return response
}

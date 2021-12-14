import axios, { CancelToken, AxiosResponse } from 'axios'
import { LoggerInstance, ProviderInstance } from '@oceanprotocol/lib'

export interface FileMetadata {
  index: number
  valid: boolean
  contentType: string
  contentLength: string
}

export async function getEncryptedFileUrls(
  files: string[],
  providerUrl: string,
  did: string,
  accountId: string
): Promise<string> {
  try {
    // https://github.com/oceanprotocol/provider/blob/v4main/API.md#encrypt-endpoint
    const url = `${providerUrl}/api/v1/services/encrypt`
    const response: AxiosResponse<{ encryptedDocument: string }> =
      await axios.post(url, {
        documentId: did,
        signature: '', // TODO: add signature
        publisherAddress: accountId,
        document: files
      })
    return response?.data?.encryptedDocument
  } catch (error) {
    console.error('Error parsing json: ' + error.message)
  }
}

export async function getFileInfo(
  url: string,
  providerUrl: string,
  cancelToken: CancelToken
): Promise<FileMetadata[]> {
  try {
    const postBody = { url }
    const response: AxiosResponse<FileMetadata[]> = await axios.post(
      `${providerUrl}/api/v1/services/fileinfo`,
      postBody,
      { cancelToken }
    )

    if (!response || response.status !== 200 || !response.data) return
    return response.data
  } catch (error) {
    if (axios.isCancel(error)) {
      LoggerInstance.log(error.message)
    } else {
      LoggerInstance.error(error.message)
    }
  }
}

async function fetchMethod(url: string): Promise<Response> {
  const result = await fetch(url)
  if (!result) {
    LoggerInstance.error(`Error requesting ${url}`)
    LoggerInstance.error(`Response message: \n${result}`)
    throw result
  }
  return result
}

export async function isValidProvider(url: string): Promise<boolean> {
  try {
    const response = await ProviderInstance.isValidProvider(url, fetchMethod)
    return response
  } catch (error) {
    console.error(`Error validating provider: ${error.message}`)
    return false
  }
}

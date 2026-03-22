/**
 * 文件说明：内容素材接口封装。
 * 功能说明：集中管理素材列表和新增接口。
 *
 * 结构概览：
 *   第一部分：接口定义
 */
import { apiClient } from './client';
import type { ContentAsset, ContentAssetPayload } from '../types/content-asset';

export async function getContentAssets(keyword?: string) {
  const response = await apiClient.get<ContentAsset[]>('/content-assets', {
    params: keyword ? { keyword } : undefined,
  });
  return response.data;
}

export async function createContentAsset(payload: ContentAssetPayload) {
  const response = await apiClient.post<ContentAsset>('/content-assets', payload);
  return response.data;
}

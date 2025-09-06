import { describe, it, expect, beforeEach, vi } from 'vitest';
import { writeNewWord, updateExistingWord, getExistingWord } from '../../../src/lib/word-editor.js';
import { 
  sampleWords, 
  sampleRepoDetails, 
  sampleBase64Content,
} from '../../fixtures/test-data/index.js';

// Mock Octokit instance
const createMockOctokit = () => ({
  request: vi.fn()
});

describe('word-editor.js', () => {
  let userOctokit;
  let forkedRepoDetails;

  beforeEach(() => {
    userOctokit = createMockOctokit();
    forkedRepoDetails = { ...sampleRepoDetails.forked };
  });

  describe('writeNewWord', () => {
    it('should create new word file with correct path', async () => {
      const word = sampleWords.api;
      
      userOctokit.request.mockResolvedValueOnce({
        data: { content: { sha: 'abc123' } }
      });

      await writeNewWord(userOctokit, forkedRepoDetails, word);

      expect(userOctokit.request).toHaveBeenCalledWith(
        'PUT /repos/{owner}/{repo}/contents/{path}',
        expect.objectContaining({
          path: 'src/content/dictionary/api.mdx'
        })
      );
    });

    it('should generate correct file path for special characters', async () => {
      const word = sampleWords.specialChars;
      
      userOctokit.request.mockResolvedValueOnce({
        data: { content: { sha: 'abc123' } }
      });

      await writeNewWord(userOctokit, forkedRepoDetails, word);

      expect(userOctokit.request).toHaveBeenCalledWith(
        'PUT /repos/{owner}/{repo}/contents/{path}',
        expect.objectContaining({
          path: 'src/content/dictionary/c++.mdx'
        })
      );
    });

    it('should encode content as base64', async () => {
      const word = sampleWords.api;
      
      userOctokit.request.mockResolvedValueOnce({
        data: { content: { sha: 'abc123' } }
      });

      await writeNewWord(userOctokit, forkedRepoDetails, word);

      const callArgs = userOctokit.request.mock.calls[0][1];
      expect(callArgs.content).toBeDefined();
      
      // Verify it's valid base64
      expect(() => {
        Buffer.from(callArgs.content, 'base64').toString('utf-8');
      }).not.toThrow();
    });

    it('should generate correct commit message', async () => {
      const word = sampleWords.api;
      
      userOctokit.request.mockResolvedValueOnce({
        data: { content: { sha: 'abc123' } }
      });

      await writeNewWord(userOctokit, forkedRepoDetails, word);

      expect(userOctokit.request).toHaveBeenCalledWith(
        'PUT /repos/{owner}/{repo}/contents/{path}',
        expect.objectContaining({
          message: 'word: commit to "API"'
        })
      );
    });

    it('should use correct branch from repo details', async () => {
      const word = sampleWords.api;
      
      userOctokit.request.mockResolvedValueOnce({
        data: { content: { sha: 'abc123' } }
      });

      await writeNewWord(userOctokit, forkedRepoDetails, word);

      expect(userOctokit.request).toHaveBeenCalledWith(
        'PUT /repos/{owner}/{repo}/contents/{path}',
        expect.objectContaining({
          branch: 'add-word-api'
        })
      );
    });

    it('should parse repository details correctly', async () => {
      const word = sampleWords.api;
      
      userOctokit.request.mockResolvedValueOnce({
        data: { content: { sha: 'abc123' } }
      });

      await writeNewWord(userOctokit, forkedRepoDetails, word);

      expect(userOctokit.request).toHaveBeenCalledWith(
        'PUT /repos/{owner}/{repo}/contents/{path}',
        expect.objectContaining({
          owner: 'testuser',
          repo: 'jargons.dev'
        })
      );
    });

    it('should handle multiline content correctly', async () => {
      const word = sampleWords.multilineContent;
      
      userOctokit.request.mockResolvedValueOnce({
        data: { content: { sha: 'abc123' } }
      });

      await writeNewWord(userOctokit, forkedRepoDetails, word);

      const callArgs = userOctokit.request.mock.calls[0][1];
      const decodedContent = Buffer.from(callArgs.content, 'base64').toString('utf-8');
      
      expect(decodedContent).toContain('Multiline');
      expect(decodedContent).toContain('multiline content');
      expect(decodedContent).toContain('special characters');
    });

    it('should throw custom error on API failure', async () => {
      const word = sampleWords.api;
      
      const apiError = new Error('API Error');
      userOctokit.request.mockRejectedValueOnce(apiError);

      await expect(
        writeNewWord(userOctokit, forkedRepoDetails, word)
      ).rejects.toThrow('Error committing new word API to dictionary');
    });

    it('should return response data on success', async () => {
      const word = sampleWords.api;
      const responseData = { content: { sha: 'abc123' }, commit: { sha: 'def456' } };
      
      userOctokit.request.mockResolvedValueOnce({
        data: responseData
      });

      const result = await writeNewWord(userOctokit, forkedRepoDetails, word);

      expect(result).toEqual(responseData);
    });
  });

  describe('updateExistingWord', () => {
    const existingWordData = {
      path: 'src/content/dictionary/api.mdx',
      sha: 'existing-sha-123',
      title: 'API',
      content: 'Updated content for API'
    };

    it('should update existing word with SHA', async () => {
      userOctokit.request.mockResolvedValueOnce({
        data: { content: { sha: 'new-sha-456' } }
      });

      await updateExistingWord(userOctokit, forkedRepoDetails, existingWordData);

      expect(userOctokit.request).toHaveBeenCalledWith(
        'PUT /repos/{owner}/{repo}/contents/{path}',
        expect.objectContaining({
          sha: 'existing-sha-123'
        })
      );
    });

    it('should use provided path for update', async () => {
      userOctokit.request.mockResolvedValueOnce({
        data: { content: { sha: 'new-sha-456' } }
      });

      await updateExistingWord(userOctokit, forkedRepoDetails, existingWordData);

      expect(userOctokit.request).toHaveBeenCalledWith(
        'PUT /repos/{owner}/{repo}/contents/{path}',
        expect.objectContaining({
          path: 'src/content/dictionary/api.mdx'
        })
      );
    });

    it('should generate correct edit commit message', async () => {
      userOctokit.request.mockResolvedValueOnce({
        data: { content: { sha: 'new-sha-456' } }
      });

      await updateExistingWord(userOctokit, forkedRepoDetails, existingWordData);

      expect(userOctokit.request).toHaveBeenCalledWith(
        'PUT /repos/{owner}/{repo}/contents/{path}',
        expect.objectContaining({
          message: 'word: edit commit to "API"'
        })
      );
    });

    it('should encode updated content as base64', async () => {
      userOctokit.request.mockResolvedValueOnce({
        data: { content: { sha: 'new-sha-456' } }
      });

      await updateExistingWord(userOctokit, forkedRepoDetails, existingWordData);

      const callArgs = userOctokit.request.mock.calls[0][1];
      expect(callArgs.content).toBeDefined();
      
      const decodedContent = Buffer.from(callArgs.content, 'base64').toString('utf-8');
      expect(decodedContent).toContain('Updated content for API');
    });

    it('should handle options parameter', async () => {
      const options = { force: true };
      
      userOctokit.request.mockResolvedValueOnce({
        data: { content: { sha: 'new-sha-456' } }
      });

      await updateExistingWord(userOctokit, forkedRepoDetails, existingWordData, options);

      // Should not throw and should still make the API call
      expect(userOctokit.request).toHaveBeenCalled();
    });

    it('should throw custom error on API failure', async () => {
      const apiError = new Error('API Error');
      userOctokit.request.mockRejectedValueOnce(apiError);

      await expect(
        updateExistingWord(userOctokit, forkedRepoDetails, existingWordData)
      ).rejects.toThrow('Error committing edit to "API"');
    });

    it('should return response data on success', async () => {
      const responseData = { content: { sha: 'new-sha-456' }, commit: { sha: 'ghi789' } };
      
      userOctokit.request.mockResolvedValueOnce({
        data: responseData
      });

      const result = await updateExistingWord(userOctokit, forkedRepoDetails, existingWordData);

      expect(result).toEqual(responseData);
    });
  });

  describe('getExistingWord', () => {
    const repoDetails = {
      repoFullname: 'testuser/jargons.dev',
      repoBranchRef: 'refs/heads/main'
    };

    it('should fetch existing word content', async () => {
      const mockResponse = {
        data: {
          content: sampleBase64Content,
          sha: 'file-sha-123',
          path: 'src/content/dictionary/api.mdx',
          name: 'api.mdx'
        }
      };

      userOctokit.request.mockResolvedValueOnce(mockResponse);

      const result = await getExistingWord(userOctokit, repoDetails, 'API');

      expect(userOctokit.request).toHaveBeenCalledWith(
        'GET /repos/{owner}/{repo}/contents/{path}',
        expect.objectContaining({
          owner: 'testuser',
          repo: 'jargons.dev',
          ref: 'refs/heads/main',
          path: 'src/content/dictionary/api.mdx'
        })
      );
    });

    it('should return decoded content', async () => {
      const mockResponse = {
        data: {
          content: sampleBase64Content,
          sha: 'file-sha-123',
          path: 'src/content/dictionary/api.mdx',
          name: 'api.mdx'
        }
      };

      userOctokit.request.mockResolvedValueOnce(mockResponse);

      const result = await getExistingWord(userOctokit, repoDetails, 'API');

      expect(result.title).toBe('API');
      expect(result.content).toBe(sampleBase64Content);
      expect(result.content_decoded).toContain('Application Programming Interface');
      expect(result.sha).toBe('file-sha-123');
    });

    it('should handle special characters in word title', async () => {
      const mockResponse = {
        data: {
          content: sampleBase64Content,
          sha: 'file-sha-123',
          path: 'src/content/dictionary/c++.mdx',
          name: 'c++.mdx'
        }
      };

      userOctokit.request.mockResolvedValueOnce(mockResponse);

      await getExistingWord(userOctokit, repoDetails, 'C++');

      expect(userOctokit.request).toHaveBeenCalledWith(
        'GET /repos/{owner}/{repo}/contents/{path}',
        expect.objectContaining({
          path: 'src/content/dictionary/c++.mdx'
        })
      );
    });

    it('should throw custom error on API failure', async () => {
      const apiError = new Error('Not Found');
      apiError.status = 404;
      userOctokit.request.mockRejectedValueOnce(apiError);

      await expect(
        getExistingWord(userOctokit, repoDetails, 'API')
      ).rejects.toThrow('Error getting "API" from dictionary');
    });

    it('should include all response data', async () => {
      const mockResponse = {
        data: {
          content: sampleBase64Content,
          sha: 'file-sha-123',
          path: 'src/content/dictionary/api.mdx',
          name: 'api.mdx',
          size: 1234,
          url: 'https://api.github.com/repos/testuser/jargons.dev/contents/src/content/dictionary/api.mdx'
        }
      };

      userOctokit.request.mockResolvedValueOnce(mockResponse);

      const result = await getExistingWord(userOctokit, repoDetails, 'API');

      expect(result.sha).toBe('file-sha-123');
      expect(result.path).toBe('src/content/dictionary/api.mdx');
      expect(result.name).toBe('api.mdx');
      expect(result.size).toBe(1234);
      expect(result.url).toContain('api.github.com');
    });
  });

  describe('writeWordFileContent (internal function)', () => {
    // This function is not exported, but we can test it indirectly through the public functions
    it('should properly format word file content through writeNewWord', async () => {
      const word = sampleWords.api;
      
      userOctokit.request.mockResolvedValueOnce({
        data: { content: { sha: 'abc123' } }
      });

      await writeNewWord(userOctokit, forkedRepoDetails, word);

      const callArgs = userOctokit.request.mock.calls[0][1];
      const decodedContent = Buffer.from(callArgs.content, 'base64').toString('utf-8');
      
      // Should contain the title and content in the template format
      expect(decodedContent).toContain('API');
      expect(decodedContent).toContain('Application Programming Interface');
    });

    it('should handle empty content through writeNewWord', async () => {
      const word = sampleWords.emptyContent;
      
      userOctokit.request.mockResolvedValueOnce({
        data: { content: { sha: 'abc123' } }
      });

      await writeNewWord(userOctokit, forkedRepoDetails, word);

      const callArgs = userOctokit.request.mock.calls[0][1];
      const decodedContent = Buffer.from(callArgs.content, 'base64').toString('utf-8');
      
      expect(decodedContent).toContain('Empty');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network errors in writeNewWord', async () => {
      const word = sampleWords.api;
      
      userOctokit.request.mockRejectedValueOnce(new Error('Network Error'));

      await expect(
        writeNewWord(userOctokit, forkedRepoDetails, word)
      ).rejects.toThrow('Error committing new word API to dictionary');
    });

    it('should handle permission errors in updateExistingWord', async () => {
      const existingWordData = {
        path: 'src/content/dictionary/api.mdx',
        sha: 'existing-sha-123',
        title: 'API',
        content: 'Updated content'
      };

      const permissionError = new Error('Forbidden');
      permissionError.status = 403;
      userOctokit.request.mockRejectedValueOnce(permissionError);

      await expect(
        updateExistingWord(userOctokit, forkedRepoDetails, existingWordData)
      ).rejects.toThrow('Error committing edit to "API"');
    });

    it('should handle not found errors in getExistingWord', async () => {
      const repoDetails = {
        repoFullname: 'testuser/jargons.dev',
        repoBranchRef: 'refs/heads/main'
      };

      const notFoundError = new Error('Not Found');
      notFoundError.status = 404;
      userOctokit.request.mockRejectedValueOnce(notFoundError);

      await expect(
        getExistingWord(userOctokit, repoDetails, 'NonExistentWord')
      ).rejects.toThrow('Error getting "NonExistentWord" from dictionary');
    });
  });
});

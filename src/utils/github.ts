const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO;

const baseHeaders = {
  'Authorization': `token ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
};

export async function fetchGithubFile(path: string) {
  try {
    if (!GITHUB_TOKEN || !GITHUB_REPO) {
      throw new Error('GitHub 설정이 없습니다. .env.local 파일을 확인해주세요.');
    }

    console.log('Fetching file:', path); // 디버깅용 로그
    
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
    const response = await fetch(url, { 
      headers: baseHeaders,
      cache: 'no-store'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API 응답 에러:', errorText);
      throw new Error(`GitHub API 오류: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.content) {
      console.error('파일 내용이 없습니다:', data);
      throw new Error('파일 내용을 찾을 수 없습니다.');
    }

    const content = JSON.parse(decodeURIComponent(escape(atob(data.content))));
    console.log('Parsed content:', content); // 디버깅용 로그
    return content;
  } catch (error) {
    console.error('GitHub 파일 읽기 오류:', error);
    throw error;
  }
}

export async function saveGithubFile(path: string, content: any) {
  try {
    if (!GITHUB_TOKEN || !GITHUB_REPO) {
      throw new Error('GitHub 설이 없습니다.');
    }

    // 현재 파일의 SHA 가져오기
    const currentFileResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
      { headers: baseHeaders }
    );

    let sha = '';
    if (currentFileResponse.ok) {
      const currentFile = await currentFileResponse.json();
      sha = currentFile.sha;
    }

    // 파일 업데이트
    const encodedContent = btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))));
    const body = {
      message: `Update ${path}`,
      content: encodedContent,
      ...(sha && { sha })
    };

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
      {
        method: 'PUT',
        headers: baseHeaders,
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      throw new Error(`파일 저장 실패: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('GitHub 파일 저장 오류:', error);
    throw error;
  }
} 
'use strict'

const db = uniCloud.database()

exports.main = async (event) => {
  const { platform, version_code } = event

  if (!platform || !version_code) {
    return { needUpdate: false }
  }

  const res = await db.collection('app-version')
    .where({
      platform,
      status: 1
    })
    .orderBy('version_code', 'desc')
    .limit(1)
    .get()

  if (res.result.data.length === 0) {
    return { needUpdate: false }
  }

  const latest = res.result.data[0]

  if (latest.version_code > version_code) {
    return {
      needUpdate: true,
      version: latest.version,
      versionCode: latest.version_code,
      updateType: latest.update_type,
      downloadUrl: latest.download_url,
      releaseNote: latest.release_note
    }
  }

  return { needUpdate: false }
}

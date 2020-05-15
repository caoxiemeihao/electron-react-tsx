import React from 'react'
import styles from './dashboard.mod.less'

const Dashboard: React.FC = () => {
  return <div
    style={{
      background:
        `url(${require('@render/assets/image/yay.jpg').default}) no-repeat center center / cover`
    }}
    className={styles.dashboard}>

  </div>
}

export default Dashboard

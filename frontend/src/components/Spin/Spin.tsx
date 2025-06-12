import { Spin } from 'antd'
import styles from './Spin.module.scss';

export const SpinComponent = () => {
  return (
    <div className={styles.container}>
        <Spin />
    </div>
  )
}

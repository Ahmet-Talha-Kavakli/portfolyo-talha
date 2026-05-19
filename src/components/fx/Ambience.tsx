import styles from "./fx.module.css";

/**
 * Tüm site üstünde ince sinematik film katmanı: hafif vignette + çok
 * düşük opaklıkta hareketli grain. pointer-events YOK (etkileşimi
 * engellemez). reduced-motion'da grain animasyonu durur (CSS).
 * Layout'ta bir kez render edilir.
 */
export default function Ambience() {
  return (
    <div className={styles.ambience} aria-hidden="true">
      <div className={styles.grain} />
    </div>
  );
}

import React from 'react';

export default function Card({ card, onFlip, disabled }) {
  const handleClick = () => {
    if (!disabled) {
      onFlip(card.id);
    }
  };

  return (
    <>
      <div className="card-container" onClick={handleClick}>
        <div className={`card ${card.flipped || card.matched ? 'flipped' : ''}`}>
          <div className="card-front">?</div>
          <div className="card-back">{card.displayValue}</div>
        </div>
      </div>

      <style jsx="true">{`
        .card-container {
          width: 100px; /* wider than before */
          height: 120px;
          perspective: 1000px;
          margin: 6px; /* slightly reduced spacing */
          cursor: pointer;
        }

        .card {
          width: 100%;
          height: 100%;
          position: relative;
          transition: transform 0.6s;
          transform-style: preserve-3d;
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.25);
          border-radius: 12px;
        }

        .card.flipped {
          transform: rotateY(180deg);
        }

        .card-front,
        .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 2rem;
          font-weight: bold;
          border: 2px solid #333;
          border-radius: 12px;
        }

        .card-front {
          background: linear-gradient(135deg, #007CF0, #00DFD8);
          color: white;
        }

        .card-back {
          background: linear-gradient(135deg, #f7971e, #ffd200);
          color: black;
          transform: rotateY(180deg);
        }
      `}</style>
    </>
  );
}

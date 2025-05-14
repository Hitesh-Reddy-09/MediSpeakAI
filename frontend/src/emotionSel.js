import React, { useState } from 'react';

const EmotionSelector = () => {
  const [selectedEmotion, setSelectedEmotion] = useState('');

  const handleEmotionChange = (event) => {
    setSelectedEmotion(event.target.value);
  };

  return (
    <div>
      <label htmlFor="emotion">How are you feeling?</label>
      <select id="emotion" name="emotion" value={selectedEmotion} onChange={handleEmotionChange}>
        <option value="" disabled hidden>Select an emotion</option>
        <option value="happy">😊 Happy</option>
        <option value="sad">😢 Sad</option>
        <option value="angry">😡 Angry</option>
        <option value="romantic">❤️ Romantic</option>
        <option value="neutral">😐 Neutral</option>
      </select>
    </div>
  );
};

export default EmotionSelector;


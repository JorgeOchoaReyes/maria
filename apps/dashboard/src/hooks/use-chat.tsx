import React from "react"; 

export const useChat = () => {
  const [loading, setLoading] = React.useState(false);

  return {
    loading,
    setLoading,
  };
};


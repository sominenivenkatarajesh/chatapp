import React from "react";
import { Search, Users, MessageSquare, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const EmptyState = ({ 
  icon: Icon = MessageSquare, 
  title = "No data found", 
  message = "There's nothing to show here yet.", 
  actionText,
  actionLink,
  onAction
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px]"
    >
      <div className="size-20 rounded-full bg-surface flex items-center justify-center border border-border shadow-xl mb-6">
        <Icon className="size-10 text-accent/70" />
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm max-w-sm mb-6 leading-relaxed">
        {message}
      </p>
      
      {actionLink && (
        <Link to={actionLink} className="btn btn-primary px-6 py-2.5 shadow-lg shadow-accent/20">
          {actionText}
        </Link>
      )}
      
      {onAction && !actionLink && (
        <button onClick={onAction} className="btn btn-primary px-6 py-2.5 shadow-lg shadow-accent/20">
          {actionText}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;

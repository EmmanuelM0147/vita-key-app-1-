import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { X, Home, DollarSign, TrendingUp, Bell, Search, Calendar } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Colors from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/theme';
import { NotificationType } from '@/types/notification';

interface SmartNotificationCardProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  propertyId?: string;
  propertyImage?: string;
  propertyTitle?: string;
  propertyLocation?: string;
  propertyPrice?: number;
  oldPrice?: number;
  newPrice?: number;
  matchScore?: number;
  isRead: boolean;
  onPress: () => void;
  onDismiss: () => void;
}

const SmartNotificationCard: React.FC<SmartNotificationCardProps> = ({
  id,
  type,
  title,
  message,
  timestamp,
  propertyId,
  propertyImage,
  propertyTitle,
  propertyLocation,
  propertyPrice,
  oldPrice,
  newPrice,
  matchScore,
  isRead,
  onPress,
  onDismiss,
}) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  const getNotificationIcon = () => {
    switch (type) {
      case 'new_property':
        return <Home size={20} color={Colors.primary.main} />;
      case 'price_drop':
        return <DollarSign size={20} color={Colors.status.success} />;
      case 'market_trend':
        return <TrendingUp size={20} color={Colors.secondary.main} />;
      case 'saved_search':
        return <Search size={20} color={Colors.primary.main} />;
      case 'viewing_reminder':
        return <Calendar size={20} color={Colors.status.warning} />;
      case 'property_update':
        return <Home size={20} color={Colors.secondary.main} />;
      case 'system':
      default:
        return <Bell size={20} color={Colors.text.muted} />;
    }
  };
  
  const renderPropertyInfo = () => {
    if (!propertyId || !propertyTitle) return null;
    
    return (
      <View style={styles.propertyContainer}>
        {propertyImage && (
          <Image
            source={{ uri: propertyImage }}
            style={styles.propertyImage}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.propertyInfo}>
          <Typography variant="body2" weight="600" numberOfLines={1}>
            {propertyTitle}
          </Typography>
          
          {propertyLocation && (
            <Typography variant="caption" color={Colors.text.muted} numberOfLines={1}>
              {propertyLocation}
            </Typography>
          )}
          
          <View style={styles.propertyPriceContainer}>
            {type === 'price_drop' && oldPrice && newPrice ? (
              <>
                <Typography variant="caption" color={Colors.text.muted} style={styles.oldPrice}>
                  ${oldPrice.toLocaleString()}
                </Typography>
                <Typography variant="body2" color={Colors.status.success}>
                  ${newPrice.toLocaleString()}
                </Typography>
                <Typography variant="caption" color={Colors.status.success} style={styles.priceDrop}>
                  {Math.round((1 - newPrice / oldPrice) * 100)}% off
                </Typography>
              </>
            ) : propertyPrice ? (
              <Typography variant="body2" color={Colors.primary.main}>
                ${propertyPrice.toLocaleString()}
              </Typography>
            ) : null}
          </View>
        </View>
      </View>
    );
  };
  
  const renderMatchScore = () => {
    if (!matchScore) return null;
    
    const percentage = Math.round(matchScore * 100);
    
    return (
      <View style={styles.matchScoreContainer}>
        <View style={[styles.matchScoreBadge, { backgroundColor: getMatchScoreColor(percentage) }]}>
          <Typography variant="caption" color={Colors.common.white}>
            {percentage}% Match
          </Typography>
        </View>
      </View>
    );
  };
  
  const getMatchScoreColor = (percentage: number) => {
    if (percentage >= 90) return Colors.status.success;
    if (percentage >= 70) return Colors.primary.main;
    if (percentage >= 50) return Colors.status.warning;
    return Colors.status.error;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isRead ? styles.readContainer : styles.unreadContainer
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {getNotificationIcon()}
        </View>
        
        <View style={styles.titleContainer}>
          <Typography variant="body1" weight="600" numberOfLines={1}>
            {title}
          </Typography>
          
          <Typography variant="caption" color={Colors.text.muted}>
            {formatTimestamp(timestamp)}
          </Typography>
        </View>
        
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
        >
          <X size={16} color={Colors.text.muted} />
        </TouchableOpacity>
      </View>
      
      <Typography variant="body2" style={styles.message} numberOfLines={2}>
        {message}
      </Typography>
      
      {renderPropertyInfo()}
      {renderMatchScore()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.common.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
  },
  unreadContainer: {
    borderLeftColor: Colors.primary.main,
  },
  readContainer: {
    borderLeftColor: Colors.border.light,
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  dismissButton: {
    padding: 4,
  },
  message: {
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  propertyContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background.light,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  propertyImage: {
    width: 80,
    height: 80,
  },
  propertyInfo: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: 'space-between',
  },
  propertyPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  oldPrice: {
    textDecorationLine: 'line-through',
    marginRight: 4,
  },
  priceDrop: {
    marginLeft: 4,
  },
  matchScoreContainer: {
    alignItems: 'flex-end',
    marginTop: Spacing.xs,
  },
  matchScoreBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
});

export default SmartNotificationCard;
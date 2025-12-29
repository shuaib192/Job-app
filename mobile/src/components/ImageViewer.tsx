import React from 'react';
import { Modal, View, Image, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { theme } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageViewerProps {
    visible: boolean;
    images: string[];
    initialIndex?: number;
    onClose: () => void;
}

export const ImageViewer = ({ visible, images, initialIndex = 0, onClose }: ImageViewerProps) => {
    const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

    React.useEffect(() => {
        if (visible) setCurrentIndex(initialIndex);
    }, [visible, initialIndex]);

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <X size={30} color={theme.colors.white} />
                    </TouchableOpacity>

                    <View style={styles.viewer}>
                        <Image
                            source={{ uri: images[currentIndex] }}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </View>

                    {images.length > 1 && (
                        <View style={styles.controls}>
                            <TouchableOpacity
                                style={[styles.navButton, currentIndex === 0 && styles.disabled]}
                                disabled={currentIndex === 0}
                                onPress={() => setCurrentIndex(prev => prev - 1)}
                            >
                                <ChevronLeft size={32} color={theme.colors.white} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.navButton, currentIndex === images.length - 1 && styles.disabled]}
                                disabled={currentIndex === images.length - 1}
                                onPress={() => setCurrentIndex(prev => prev + 1)}
                            >
                                <ChevronRight size={32} color={theme.colors.white} />
                            </TouchableOpacity>
                        </View>
                    )}
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
    },
    safeArea: {
        flex: 1,
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    viewer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.8,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        paddingBottom: 40,
    },
    navButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabled: {
        opacity: 0.3,
    }
});

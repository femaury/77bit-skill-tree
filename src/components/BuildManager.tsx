import { useState, useRef } from 'react';
import { useSkill } from '../context/SkillContext';
import { ChevronDownIcon, TrashIcon } from '@radix-ui/react-icons';
import * as Collapsible from '@radix-ui/react-collapsible';

interface BuildManagerProps {
  onClose: () => void;
}

const secondaryButtonClass = `px-4 py-2 bg-black/10 text-white rounded-lg hover:bg-black/20 
                          transition-colors border-2 border-accent/50 hover:border-accent 
                          font-medium cursor-pointer`;

const primaryButtonClass = `px-4 py-2 bg-accent text-black rounded-lg hover:bg-accent/80 
                        transition-colors font-medium shadow-sm cursor-pointer`;

export function BuildManager({ onClose }: BuildManagerProps) {
  const [buildName, setBuildName] = useState('');
  const [showSavedBuilds, setShowSavedBuilds] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showShareUrl, setShowShareUrl] = useState(false);
  const [notification, setNotification] = useState('');
  const urlInputRef = useRef<HTMLInputElement>(null);
  
  const {
    saveBuildToLocalStorage,
    loadBuildFromLocalStorage,
    getSavedBuilds,
    deleteSavedBuild,
    exportBuildToURL,
  } = useSkill();

  const handleSaveBuild = () => {
    if (!buildName.trim()) {
      setNotification('Please enter a build name');
      setTimeout(() => setNotification(''), 3000);
      return;
    }
    
    saveBuildToLocalStorage(buildName);
    setBuildName('');
    setNotification('Build saved successfully!');
    setTimeout(() => setNotification(''), 3000);
    onClose();
  };

  const handleLoadBuild = (name: string) => {
    loadBuildFromLocalStorage(name);
    setShowSavedBuilds(false);
    setNotification(`Loaded build: ${name}`);
    setTimeout(() => setNotification(''), 3000);
    onClose();
  };

  const handleDeleteBuild = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSavedBuild(name);
    setNotification(`Deleted build: ${name}`);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleShareBuild = () => {
    const url = exportBuildToURL();
    setShareUrl(url);
    setShowShareUrl(true);
  };

  const handleCopyUrl = () => {
    if (urlInputRef.current) {
      urlInputRef.current.select();
      document.execCommand('copy');
      setNotification('URL copied to clipboard!');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Save Build */}
        <div>
          <h3 className="text-white font-semibold mb-3">Save Current Build</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={buildName}
              onChange={(e) => setBuildName(e.target.value)}
              placeholder="Enter build name"
              className="flex-1 px-3 py-2 rounded-lg bg-black/30 text-white border-2 border-white/20 
                       placeholder:text-white/50 focus:outline-none focus:border-accent"
            />
            <button
              onClick={handleSaveBuild}
              className={primaryButtonClass}
            >
              Save
            </button>
          </div>
        </div>
        
        {/* Load Build */}
        <div>
          <h3 className="text-white font-semibold mb-3">Saved Builds</h3>
          <Collapsible.Root open={showSavedBuilds} onOpenChange={setShowSavedBuilds}>
            <Collapsible.Trigger className={`w-full ${secondaryButtonClass} flex justify-between items-center`}>
              <span>{showSavedBuilds ? 'Hide Builds' : 'Show Builds'}</span>
              <ChevronDownIcon 
                className={`h-4 w-4 text-accent transition-transform ${showSavedBuilds ? 'rotate-180' : ''}`}
              />
            </Collapsible.Trigger>
            
            <Collapsible.Content className="mt-2">
              <div className="rounded-lg border-2 border-white/20 bg-black/30 overflow-hidden">
                {getSavedBuilds().length > 0 ? (
                  <div className="max-h-[200px] overflow-y-auto scrollbar">
                    <ul className="divide-y divide-white/20">
                      {getSavedBuilds().map((name) => (
                        <li key={name} className="flex justify-between items-center px-3 py-2 hover:bg-white/5">
                          <button
                            onClick={() => handleLoadBuild(name)}
                            className="text-left text-white hover:text-accent flex-1 cursor-pointer"
                          >
                            {name}
                          </button>
                          <button
                            onClick={(e) => handleDeleteBuild(name, e)}
                            className="ml-4 text-red-400 hover:text-red-300 p-1 cursor-pointer"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-white/50 px-3 py-2">No saved builds found</p>
                )}
              </div>
            </Collapsible.Content>
          </Collapsible.Root>
        </div>
        
        {/* Share Build */}
        <div>
          <h3 className="text-white font-semibold mb-3">Share Build</h3>
          <div className="space-y-3">
            <div>
              <button
                onClick={handleShareBuild}
                className={secondaryButtonClass}
              >
                Generate Share Link
              </button>
            </div>
            
            {showShareUrl && (
              <div className="rounded-lg border-2 border-white/20 bg-black/30 p-3">
                <div className="flex gap-2">
                  <input
                    ref={urlInputRef}
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 rounded-lg bg-black/30 text-white border-2 border-white/20 
                             focus:outline-none focus:border-accent text-sm"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className={primaryButtonClass}
                  >
                    Copy
                  </button>
                </div>
                <p className="text-white/50 text-xs mt-2">
                  Share this URL with others to share your build
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification - Moved outside modal content */}
      {notification && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/90 
                     text-white rounded-lg shadow-lg border-2 border-white/20 text-sm backdrop-blur-sm
                     z-[100]">
          {notification}
        </div>
      )}
    </>
  );
} 
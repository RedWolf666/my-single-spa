import bootstrapApp from '../lifecycle/bootstrap'
import mountApp from '../lifecycle/mount'
import unMountApp from '../lifecycle/unmount'
import { AppStatus } from '../config'

export const apps = []

export async function loadApps() {
    const toLoadApp = getAppsWithStatus(AppStatus.BEFORE_BOOTSTRAP)
    const toUnMountApp = getAppsWithStatus(AppStatus.MOUNTED)
    const loadPromise = toLoadApp.map(bootstrapApp)
    const unMountPromise = toUnMountApp.map(unMountApp)
    await Promise.all([...loadPromise, ...unMountPromise])
    
    const toMountApp = [
        ...getAppsWithStatus(AppStatus.BOOTSTRAPPED),
        ...getAppsWithStatus(AppStatus.UNMOUNTED),
    ]
    
    await toMountApp.map(mountApp)
}

function getAppsWithStatus(status) {
    const result = []
    apps.forEach(app => {
        // tobootstrap or tomount
        if (isActive(app) && app.status === status) {
            switch (app.status) {
                case AppStatus.BEFORE_BOOTSTRAP:
                case AppStatus.BOOTSTRAPPED:
                case AppStatus.UNMOUNTED:
                    result.push(app)
                    break
            }
        } else if (app.status === AppStatus.MOUNTED && status === AppStatus.MOUNTED) {
            // tounmount
            result.push(app)
        }
    })

    return result
}

function isActive(app) {
    return typeof app.activeRule === 'function' && app.activeRule(window.location)
}